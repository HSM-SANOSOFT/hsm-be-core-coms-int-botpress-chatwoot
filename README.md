### Inside the devcontainer
1. Run the setup and install global dependencies:
   ```sh
   pnpm setup && source /home/node/.bashrc && pnpm install -g @botpress/cli
   ```

### Navigate to Chatwoot Integration Folder
2. Move to the Chatwoot integration directory:
   ```sh
   cd <chatwoot-integration-folder>
   ```

### Install Dependencies
3. Install required dependencies:
   ```sh
   pnpm install
   ```

4. Build the integration:
   ```sh
   bp build
   ```

### Log into Botpress
5. Log in to Botpress:
   ```sh
   bp login
   ```

### Build and Deploy Integration
6. To build the integration:
   ```sh
   bp build
   ```

7. To deploy the integration:
   ```sh
   bp deploy

### Botpress Cliente Help
8. To accces the botpress client menu
   ```sh
   bp --help
   
