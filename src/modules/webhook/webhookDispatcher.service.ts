import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook, WebhookWithStats } from './repositories/webhook.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of, catchError, firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { TxServiceEvent } from '../events/event.dto';
import { WebhookService } from './webhook.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class WebhookDispatcherService {
  private readonly logger = new Logger(WebhookDispatcherService.name);
  private webhookMap: Map<string, WebhookWithStats> = new Map();
  private webhookFailureThreshold: number;
  private webhookHealthMinutesWindow: number;
  private autoDisableWebhook: boolean;

  constructor(
    @InjectRepository(Webhook)
    private readonly WebHooksRepository: Repository<Webhook>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly webhookService: WebhookService,
  ) {
    this.webhookFailureThreshold = this.configService.get<number>(
      'WEBHOOK_FAILURE_THRESHOLD',
      90,
    );
    this.webhookHealthMinutesWindow = this.configService.get<number>(
      'WEBHOOK_HEALTH_MINUTES_WINDOW',
      60,
    );
    // Disabled by default
    this.autoDisableWebhook =
      this.configService.get('WEBHOOK_AUTO_DISABLE') === 'true';
  }

  /**
   * Initializes the service by loading active webhooks from the database into memory.
   * This ensures that the service is ready to dispatch events upon startup.
   * Load at startup nestjs app.
   */
  async onModuleInit() {
    this.logger.log({
      message: 'Loading webhooks list at startup',
    });
    await this.refreshWebhookMap();
  }

  /**
   * Retrieves all active webhooks from the database.
   *
   * @returns {Promise<Webhook[]>} A promise that resolves to an array of active webhooks.
   */
  getAllActive(): Promise<Webhook[]> {
    return this.WebHooksRepository.findBy({ isActive: true });
  }

  /**
   * Disables a webhook by its ID.
   *
   * @param {string} id - The unique identifier of the webhook to disable.
   * @returns {Promise<boolean>} A promise that resolves to true if the webhook was successfully disabled.
   * @throws {NotFoundException} If the webhook with the given ID is not found.
   * @throws {Error} If there is any other error during the database update.
   */
  async disableWebhook(id: string): Promise<boolean> {
    try {
      const result = await this.WebHooksRepository.update(
        { id },
        { isActive: false },
      );

      if (result.affected === 0) {
        this.logger.warn(`Webhook with ID ${id} not found or already inactive.`);
        throw new NotFoundException(`Webhook with ID ${id} not found or already inactive.`);
      }
      return true;
    } catch (error) {
      this.logger.error(`Failed to disable webhook with ID ${id}.`, error.stack);
      throw error;
    }
  }

  /**
   * Returns the in-memory list of active webhooks with their statistics.
   *
   * @returns {WebhookWithStats[]} An array of active webhooks with statistics.
   */
  getCachedActiveWebhooks(): WebhookWithStats[] {
    return Array.from(this.webhookMap.values());
  }

  /**
   * Iterates through all active webhooks and posts the event to the relevant ones.
   *
   * @param {TxServiceEvent} parsedMessage - The event to be dispatched.
   * @returns {Promise<(AxiosResponse | undefined)[]>} A promise that resolves to an array of Axios responses or undefined for failed requests.
   */
  async postEveryWebhook(
    parsedMessage: TxServiceEvent,
  ): Promise<(AxiosResponse | undefined)[]> {
    const webhooks: WebhookWithStats[] = this.getCachedActiveWebhooks();
    const responses: Promise<AxiosResponse | undefined>[] = webhooks
      .filter((webhook: WebhookWithStats) => {
        return webhook.isEventRelevant(parsedMessage);
      })
      .map((webhook: WebhookWithStats) => {
        this.logger.debug(
          `Sending ${JSON.stringify(parsedMessage)} to ${webhook.url}`,
        );
        return this.postWebhook(parsedMessage, webhook);
      });
    return Promise.all(responses);
  }

  /**
   * Safely stringifies response data for logging purposes.
   *
   * @param {*} responseData - The data to be stringified.
   * @returns {string} The stringified data or an error message if parsing fails.
   */
  parseResponseData(responseData: any): string {
    if (typeof responseData === 'string') {
      return responseData;
    }
    let dataStr: string;
    try {
      dataStr = JSON.stringify(responseData);
    } catch {
      dataStr = 'Cannot parse response data';
    }
    return dataStr;
  }

  /**
   * Sends a single event to a specific webhook URL.
   *
   * @param {TxServiceEvent} parsedMessage - The event to be sent.
   * @param {WebhookWithStats} webhook - The webhook to which the event will be sent.
   * @returns {Promise<AxiosResponse | undefined>} A promise that resolves to the Axios response or undefined if the request fails.
   */
  postWebhook(
    parsedMessage: TxServiceEvent,
    webhook: WebhookWithStats,
  ): Promise<AxiosResponse | undefined> {
    const headers = webhook.authorization
      ? { Authorization: webhook.authorization }
      : {};
    const startTime = Date.now();
    return firstValueFrom(
      this.httpService.post(webhook.url, parsedMessage, { headers }).pipe(
        catchError((error: AxiosError) => {
          webhook.incrementFailure();
          if (error.response !== undefined) {
            // Response received status code but status code not 2xx
            const responseData = this.parseResponseData(error.response.data);
            this.logger.error({
              message: 'Error sending event',
              messageContext: {
                event: parsedMessage,
                httpRequest: {
                  url: webhook.url,
                  startTime: startTime,
                },
                httpResponse: {
                  data: responseData,
                  statusCode: error.response.status,
                },
              },
            });
          } else if (error.request !== undefined) {
            // Request was made but response was not received
            this.logger.error({
              message: 'Error sending event',
              messageContext: {
                event: parsedMessage,
                httpRequest: {
                  url: webhook.url,
                  startTime: startTime,
                },
                httpResponse: null,
                httpRequestError: {
                  message: `Response not received. Error: ${error.message}`,
                },
              },
            });
          } else {
            // Cannot make request
            this.logger.error({
              message: 'Error sending event',
              messageContext: {
                event: parsedMessage,
                httpRequest: {
                  url: webhook.url,
                  startTime: startTime,
                },
                httpResponse: null,
                httpRequestError: {
                  message: error.message,
                },
              },
            });
          }
          return of(undefined);
        }),
      ),
    ).then((response: AxiosResponse | undefined) => {
      if (response) {
        webhook.incrementSuccess();
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;
        const responseData = this.parseResponseData(response.data);
        this.logger.debug({
          message: 'Success sending event',
          messageContext: {
            event: parsedMessage,
            httpRequest: {
              url: webhook.url,
              startTime: startTime,
              endTime: endTime,
            },
            httpResponse: {
              data: responseData,
              statusCode: response.status,
              elapsedTimeMs: elapsedTime,
            },
          },
        });
      }
      return response;
    });
  }

  /**
   * Evaluates the health of all webhooks by checking if any webhook has a consistently high failure rate.
   * If a webhook exceeds the defined failure threshold within the allowed time window,
   * it will be marked as disabled to prevent further issues.
   */
  async checkWebhooksHealth() {
    this.logger.debug('Starting to check webhooks health');
    const activeWebhooks = this.getCachedActiveWebhooks();
    const healthChecks = activeWebhooks.map(async (webhook) => {
      if (
        webhook.getMinutesFromStartTime() >= this.webhookHealthMinutesWindow
      ) {
        const failureRate = webhook.getFailureRate();
        if (failureRate > this.webhookFailureThreshold) {
          if (this.autoDisableWebhook) {
            const wasDisabled = await this.disableWebhook(webhook.id);
            if (wasDisabled) {
              this.logger.warn({
                message: `Webhook disabled — ID: ${webhook.id}, URL: ${webhook.url}, failure rate exceeded threshold.`,
              });
            } else {
              this.logger.error({
                message: `Failed to disable webhook — ID: ${webhook.id}, URL: ${webhook.url}.`,
              });
            }
          } else {
            this.logger.warn({
              message: `Webhook exceeded failure threshold but was not disabled (autoDisableWebhook is OFF) — ID: ${webhook.id}, URL: ${webhook.url}.`,
            });
          }
        }
        webhook.resetStats();
      }
    });
    await Promise.all(healthChecks);
    this.logger.debug('Ending check webhooks health');
  }

  /**
   * Periodically refreshes the in-memory webhook map from the database.
   * This method runs as a cron job every minute and ensures that the webhook map is always in sync
   * with the current state of the active webhooks in the database, while maintaining webhook health stats and status.
   */
  @Cron('* * * * *') // Run every minute
  async refreshWebhookMap() {
    try {
      // First check webhooks health
      await this.checkWebhooksHealth();
      const webhooksFromDb = await this.getAllActive();

      const newWebhookMap = new Map<string, WebhookWithStats>();
      this.logger.debug({
        message: 'Loading webhooks list',
      });
      for (const dbWebhook of webhooksFromDb) {
        const id = dbWebhook.id.toString();
        if (this.webhookMap.has(id)) {
          const existingWebhook = this.webhookMap.get(id)!;
          Object.assign(existingWebhook, dbWebhook);
          newWebhookMap.set(id, existingWebhook);
        } else {
          const webhookWithStats = Object.assign(
            new WebhookWithStats(),
            dbWebhook,
          );
          newWebhookMap.set(id, webhookWithStats);
        }
      }
      this.webhookMap = newWebhookMap;
    } catch (error) {
      this.logger.error({
        message: 'Error updating the webhooks list',
        messageContext: {
          error: error,
        },
      });
    }
    this.logger.debug({
      message: 'Ending loading webhooks list',
    });
  }
}
