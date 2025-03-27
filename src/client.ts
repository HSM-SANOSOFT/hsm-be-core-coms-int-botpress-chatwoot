import type { AxiosInstance } from 'axios';
import axios from 'axios';

import type { Logger } from '.botpress';

export class ChatwootClient {
  private axios: AxiosInstance;

  constructor(
    private logger: Logger,
    private ApiKey: string,
    private accountId: number,
    private baseURL: string,
    private formData?: boolean,
  ) {
    const url = `${this.baseURL}/api/v1/accounts/${this.accountId}`;
    if (this.formData) {
      this.axios = axios.create({
        baseURL: url,
        headers: {
          api_access_token: this.ApiKey,
          'Content-Type':
            'multipart/form-data; boundary=----WebKitFormBoundary',
        },
      });
    }
    this.axios = axios.create({
      baseURL: url,
      headers: {
        api_access_token: this.ApiKey,
        'Content-Type': 'application/json',
      },
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
      name: 'Test Agent Bot',
      outgoing_url,
      description: 'Test Agent Bot',
    });
    this.logger.forBot().debug('Agent Bot Created' + JSON.stringify(data));
    return data;
  }

  async deleteAgentBot(agentBotId: Array<number>) {
    for (const id of agentBotId) {
      if (id !== 2366) {
        await this.axios.delete(`/agent_bots/${id}`, {
          headers: { api_access_token: this.ApiKey },
        });
        this.logger.forBot().debug(`Deleted agent bot ID: ${id}`);
      }
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
      | 'image'
      | 'video'
      | 'audio'
      | 'file'
      | 'card'
      | 'carousel'
      | 'cards'
      | 'location'
      | 'bloc'
      | 'dropdown'
      | 'choice',
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
    if (
      content_type === 'image' ||
      content_type === 'video' ||
      content_type === 'audio' ||
      content_type === 'file'
    ) {
      const stream = await axios.get(content, { responseType: 'stream' });
      const formData = new FormData();
      formData.append('attachments[]', stream.data);
      formData.append('content', content);
      formData.append('message_type', 'outgoing');
      formData.append('file_type', content_type);

      const { data } = await this.axios.post<response>(
        `/conversations/${conversation_id}/messages`,
        formData,
      );

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
    }>(`/conversations/${conversation_id}`, { status });

    this.logger.forBot().debug('Status Changed' + JSON.stringify(data));
    return data;
  }

  async getContact(contact_Id: number) {
    const { data } = await this.axios.get<{
      id: number;
      availability_status: string;
      payload: {
        contact: {
          email: string;
          name: string;
          phone_number: string;
          thumbnail: string;
          additional_attributes: Record<string, unknown>;
          custom_attributes: Record<string, unknown>;
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
    }>(`/contacts/${contact_Id}`, {
      headers: { api_access_token: this.ApiKey },
    });

    const {
      email,
      name,
      phone_number,
      additional_attributes,
      custom_attributes,
    } = data.payload.contact;

    const response = {
      email,
      name,
      phone_number,
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
    updateData: {
      name?: string;
      email?: string;
      phone_number?: string;
      avatar?: string;
      avatar_url?: string;
      identifier?: string;
      custom_attributes?: Record<string, unknown>;
    },
  ) {
    const { data } = await this.axios.put<{
      id: number;
      payload: {
        contact: {
          email: string;
          name: string;
          phone_number: string;
          thumbnail: string;
          additional_attributes: Record<string, unknown>;
          custom_attributes: Record<string, unknown>;
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
    }>(
      `/contacts/${contact_Id}`,
      { ...updateData },
      { headers: { api_access_token: this.ApiKey } },
    );

    const {
      email,
      name,
      phone_number,
      additional_attributes,
      custom_attributes,
    } = data.payload.contact;

    const response = {
      email,
      name,
      phone_number,
      additional_attributes,
      custom_attributes,
    };
    this.logger.forBot().debug('Contact Updated' + JSON.stringify(response));
    return response;
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
    }>(`/conversations/${conversation_id}/assign`, {
      assignee_id,
      team_id,
    });

    this.logger.forBot().debug('Conversation Assigned' + JSON.stringify(data));
    return data;
  }
}
