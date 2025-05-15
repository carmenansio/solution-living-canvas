# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {

  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_22
    pkgs.jdk19
    pkgs.nodePackages.nodemon
  ];

  # Follow the configuration steps in the README to set up your project.
  # Sets environment variables in the workspace
  env = {
    # TODO: Add your configuration here.
    GOOGLE_CLOUD_PROJECT_ID = "YOUR_GOOGLE_CLOUD_PROJECT_ID";
    GOOGLE_CLOUD_LOCATION = "YOUR_CLOUD_LOCATION";
    GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY";
  };

  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "ms-vscode.js-debug"
      "angular.ng-template"
    ];

    # Workspace lifecycle hooks
    workspace = {
      onCreate = {
        # Set up the backend API and install dependencies
        server-install = "cd server && npm install";
        client-install = "cd client && npm ci --no-audit --prefer-offline --no-progress --timing || npm i --no-audit --no-progress --timing";

        default.openFiles = [
          # Open the entry point for the backend API.
          "server/helpers/gemini-generation.ts"
          # Open the entry point for the Angular Client app.
          # "src/app/app.component.ts"
        ];
      };
      # Runs when the workspace is (re)started
      onStart = {
        # Start the backend API for development.
        server = "cd server && npm run dev";
      };
    };

    # Enable previews
    previews = {
      enable = true;
      previews = {
        web = {
          # Run "npm run dev" with PORT set to Firebase Studio's defined port for previews,
          # and show it in the web preview panel
          cwd = "client";
          command = [ "npm" "run" "start" "--" "--port" "$PORT" "--host" "0.0.0.0" "--disable-host-check" ];
          manager = "web";
          env = {
            # Environment variables to set for your server
            PORT = "$PORT";
          };
        };
      };
    };
  };
}
