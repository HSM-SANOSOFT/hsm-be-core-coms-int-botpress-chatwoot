# Setup devcontainer
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

# Setup Integration Folder
1. Move to the Chatwoot integration directory:
   ```sh
   cd Chatwoot-Botpress-Integration
   ```

   ### Install Dependencies
2. Install the Botpress SDK:
   ```sh
   pnpm add @botpress/sdk
   ```

# Setup Botpress Client
1. Log in to Botpress:
   ```sh
   bp login
   ```

# Build and Deploy Integration
1. To build the integration:
   ```sh
   bp build
   ```

2. To deploy the integration:
   ```sh
   bp deploy
   ```

# Botpress Cliente Help
1. To access the Botpress client menu:
   ```sh
   bp --help
   ```
