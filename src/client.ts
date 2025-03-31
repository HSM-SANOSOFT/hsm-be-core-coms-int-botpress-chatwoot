import type { AxiosInstance } from 'axios';
import { AxiosError } from 'axios';
import axios from 'axios';
import FormData from 'form-data';
import Mime from 'mime';

import type { Logger } from '.botpress';

interface AxiosErrorData {
  message?: string;
  attributes?: string[];
}
type updateData = {
  name?: string;
  email?: string;
  phone_number?: string;
  custom_attributes?: Record<string, unknown>;
};

type contact = {
  payload: {
    id: number;
    availability_status: string;
    email?: string | null;
    name?: string | null;
    phone_number?: string | null;
    thumbnail: string;
    additional_attributes: Record<string, unknown> | object;
    custom_attributes: Record<string, unknown> | object;
    contact_inboxes: Array<{
      source_id: string;
      inbox: {
        id: number;
        name: string;
        website_url: string;
        channel_type: string;
        avatar_url: string;
        widget_color: string;
        website_token: string;
        enable_auto_assignment: boolean;
        web_widget_script: string;
        welcome_title: string;
        welcome_tagline: string;
        greeting_enabled: boolean;
        greeting_message: string;
      };
    }>;
  };
};

export class ChatwootClient {
  private axios: AxiosInstance;

  constructor(
    private logger: Logger,
    private ApiKey: string,
    private accountId: number,
    private url: string,
  ) {
    const baseURL = `${this.url}/api/v1/accounts/${this.accountId}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      api_access_token: this.ApiKey,
    };
    this.axios = axios.create({
      baseURL,
      headers,
    });
  }

  async createAgentBot(outgoing_url: string) {
    this.logger.forBot().debug('Creating Chatwoot agent bot');
    const { data } = await this.axios.post<{
      id: number;
      name: string;
      description: string;
      outgoing_url: string;
      bot_type: string;
      bot_config: Record<string, unknown>;
      account_id: number;
      access_token: string;
    }>(`/agent_bots`, {
      name: 'Botpress Agent Bot',
      outgoing_url,
      description: 'Botpress Agent Bot',
    });
    this.logger.forBot().debug('Agent Bot Created' + JSON.stringify(data));
    return data;
  }

  async getAgentBot() {
    const { data } = await this.axios.get<
      Array<{
        id: number;
        name: string;
        description: string;
        outgoing_url: string;
        bot_type: string;
        bot_config: Record<string, unknown>;
        account_id: number;
        access_token: string;
      }>
    >(`/agent_bots`);

    const agentBotIds = data.map(bot => bot.id);

    this.logger.forBot().debug('Agent Bots' + JSON.stringify(agentBotIds));

    return agentBotIds;
  }

  async deleteAgentBot(agentBotIds: Array<number>) {
    for (const id of agentBotIds) {
      await this.axios.delete(`/agent_bots/${id}`, {
        headers: { api_access_token: this.ApiKey },
      });
      this.logger.forBot().debug(`Deleted agent bot ID: ${id}`);
      //if (id !== 2366) {}
    }
    this.logger.forBot().debug('Agent Bot deletion process completed');
  }

  async assignAgentBot(agent_bot: number, inboxId: Array<number>) {
    this.logger
      .forBot()
      .debug(
        `Assigning Chatwoot agent bot with id: ${agent_bot} to inboxes with ids: ${inboxId.toString()}`,
      );
    for (const id of inboxId) {
      await this.axios.post(`/inboxes/${id}/set_agent_bot`, {
        agent_bot,
      });
      this.logger.forBot().debug(`Assigning Agent Bot to inbox ID: ${id}`);
    }
    this.logger.forBot().debug('Agent Bot Assigment Process Completed');
  }

  async showInboxAgentBot(inboxId: number) {
    this.logger
      .forBot()
      .debug(`Showing Chatwoot agent bot assigned to inbox ${inboxId}`);
    const { data } = await this.axios.get<{
      id: number;
      name: string;
      description: string;
      outgoing_url: string;
      bot_type: string;
      bot_config: Record<string, unknown>;
      account_id: number;
      access_token: {
        id: number;
        owner_type: string;
        owner_id: number;
        token: string;
        created_at: string;
        updated_at: string;
      };
    }>(`/inboxes/${inboxId}/agent_bot`);
    this.logger
      .forBot()
      .debug(
        `Agent Bot Assigned to inbox ${inboxId} has api token: ${data.access_token.token}`,
      );
    this.logger.forBot().debug('Agent Bot Assigned' + JSON.stringify(data));
    return data;
  }

  async createNewMessage(
    conversation_id: string,
    content: string,
    message_type: 'incoming' | 'outgoing',
    privates: boolean,
    content_type:
      | 'text'
      | 'input_select' // dropdown or choice
      | 'cards'
      | 'image'
      | 'video'
      | 'audio'
      | 'file',
    content_attributes?: unknown,
    template_params?: Record<string, unknown>,
  ) {
    type response = {
      id: number;
      content: string;
      content_type: string;
      content_attributes: Record<string, unknown>;
      message_type: 'incoming' | 'outgoing' | 'activity' | 'template';
      created_at: number;
      private: boolean;
      attachments: Record<string, unknown>;
      sender: Record<string, unknown>;
      conversation_id: number;
    };
    if (['image', 'video', 'audio', 'file'].includes(content_type)) {
      const stream = await axios.get(content, { responseType: 'stream' });
      const urlPath = new URL(content);
      const file = urlPath.pathname.split('/').pop() as string;
      const mimeType = Mime.getType(file) as string;
      const filename = ''; //file.split('.').shift() as string;
      const formData = new FormData();
      formData.append('attachments[]', stream.data, {
        filename,
        contentType: mimeType,
        filepath: content,
      });
      formData.append('content', filename);
      formData.append('message_type', 'outgoing');
      formData.append('file_type', mimeType);

      const headers = {
        ...formData.getHeaders(),
        api_access_token: this.ApiKey,
      };

      const { data } = await this.axios.post<response>(
        `/conversations/${conversation_id}/messages`,
        formData,
        { headers },
      );

      this.logger.forBot().debug('File Sent' + JSON.stringify(data));
      return data;
    }
    const { data } = await this.axios.post<response>(
      `/conversations/${conversation_id}/messages`,
      {
        content,
        message_type,
        privates,
        content_type,
        content_attributes,
        template_params,
      },
    );

    this.logger.forBot().debug('Message Created' + JSON.stringify(data));
    return data;
  }

  async getContact(contact_Id: number) {
    const { data } = await this.axios.get<contact>(`/contacts/${contact_Id}`);

    const {
      email,
      name,
      phone_number,
      additional_attributes,
      custom_attributes,
    } = data.payload;

    const response = {
      email: email ?? '',
      name,
      phone_number: phone_number ?? '',
      additional_attributes,
      custom_attributes,
    };
    this.logger
      .forBot()
      .debug('Contact Information' + JSON.stringify(response));
    return response;
  }

  async updateContact(
    contact_Id: number,
    dataU: {
      name?: string;
      email?: string;
      phone_number?: string;
      custom_attributes?: Record<string, unknown>[];
    },
  ) {
    const bodyBuilder = (addEmail = true): updateData => {
      const updateData: updateData = {};

      if (dataU.name) {
        updateData.name = dataU.name;
      }

      if (dataU.email && addEmail) {
        updateData.email = dataU.email;
      }

      if (dataU.phone_number) {
        updateData.phone_number = dataU.phone_number;
      }

      if (dataU.custom_attributes?.length) {
        updateData.custom_attributes = dataU.custom_attributes[0];
      }

      this.logger.forBot().warn('updateData', updateData);
      return updateData;
    };

    const request = (Payload: updateData) => async () => {
      const { data } = await this.axios.put<contact>(
        `/contacts/${contact_Id}`,
        { ...Payload },
      );

      const {
        email,
        name,
        phone_number,
        additional_attributes,
        custom_attributes,
      } = data.payload;

      const response = {
        email,
        name,
        phone_number,
        additional_attributes,
        custom_attributes,
      };

      this.logger.forBot().debug('Contact Updated' + JSON.stringify(response));
      return response;
    };

    try {
      const body = bodyBuilder();
      return await request(body)();
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        const errData = error.response.data as AxiosErrorData;

        const isDuplicateEmail =
          errData.message === 'Email has already been taken' &&
          errData.attributes?.includes('email');

        if (isDuplicateEmail) {
          this.logger
            .forBot()
            .warn('Email already taken. Retrying without email.');

          const retryBody = bodyBuilder(false);
          return await request(retryBody)();
        }
      }

      throw error;
    }
  }

  async toggleStatus(
    conversation_id: number,
    status: 'open' | 'resolved | pending',
  ) {
    const { data } = await this.axios.post<{
      meta: Record<string, unknown>;
      payload: {
        success: boolean;
        current_status: 'open' | 'resolved';
        conversation_id: number;
      };
    }>(`/conversations/${conversation_id}/toggle_status`, { status });

    this.logger.forBot().debug('Status Changed' + JSON.stringify(data));
    return data;
  }

  async assignConversation({
    conversation_id,
    assignee_id,
    team_id,
  }: {
    conversation_id: number;
    assignee_id?: number;
    team_id?: number;
  }) {
    const { data } = await this.axios.post<{
      id: number;
      uid: string;
      name: string;
      available_name: string;
      display_name: string;
      email: string;
      account_id: number;
      role: string;
      confirmed: boolean;
      custom_attributes: Record<string, unknown>;
      account: Array<Record<string, unknown>>;
    }>(`/conversations/${conversation_id}/assignments`, {
      assignee_id,
      team_id,
    });

    this.logger.forBot().debug('Conversation Assigned' + JSON.stringify(data));
    return data;
  }
}
