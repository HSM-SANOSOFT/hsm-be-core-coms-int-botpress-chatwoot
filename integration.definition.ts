import { IntegrationDefinition } from '@botpress/sdk';

import { integrationName } from './package.json';
import {
  actions,
  channels,
  configuration,
  events,
  states,
  user,
} from './src/definitions';

export default new IntegrationDefinition({
  name: integrationName,
  version: '6.0.1',
  readme: 'hub.md',
  title: 'Chatwoot',
  description: 'Chatwoot Integration for live agent handoff',
  icon: 'icon.svg',

  configuration,
  actions,
  states,
  channels,
  user,
  events,
});
