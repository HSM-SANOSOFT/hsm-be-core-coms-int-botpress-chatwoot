### Inside the devcontainer
1. Run the setup and install global dependencies:
   ```sh
   pnpm setup && source /home/node/.bashrc && pnpm install -g @botpress/cli
   ```

2. Install Botpress CLI:

   ```sh
   pnpm install -g @botpress/cli
   ```

3. Clone the Repo
   ``` sh
   git clone https://github.com/rsantamaria01/Chatwoot-Botpress-Integration.git
   ```

### Navigate to Chatwoot Integration Folder
2. Move to the Chatwoot integration directory:
   ```sh
   cd Chatwoot-Botpress-Integration
   ```

### Install Dependencies
3. Install the Botpress SDK:
   ```sh
   pnpm add @botpress/sdk
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
   ```

### Botpress Cliente Help
8. To access the Botpress client menu:
   ```sh
   bp --help
   ```
