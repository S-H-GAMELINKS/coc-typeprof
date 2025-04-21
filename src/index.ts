import { ExtensionContext, services, workspace, LanguageClientOptions, LanguageClient, Uri } from 'coc.nvim'

export async function activate(context: ExtensionContext): Promise<void> {
  const serverOptions = {
    command: 'bundle',
    args: [
      'exec',
      'typeprof',
      '--stdio',
      '--lsp'
    ],
  }

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'ruby' },
      { scheme: 'file', pattern: '**/*.rb' }
    ],
    synchronize: {
      configurationSection: 'typeprof',
      fileEvents: workspace.createFileSystemWatcher('{**/*.rb}')
    },
    initializationOptions: {
      capabilities: {
        hoverProvider: true,
	definitionProvider: true,
      },
      workspaceFolders: [
        {
          uri: workspace.workspaceFolder ? Uri.file(workspace.workspaceFolder.uri).toString() : '',
        }
      ]
    },
    rootPatterns: ['Gemfile', '.git']
  };

  const client = new LanguageClient(
    'typeprof',
    'typeprof',
    serverOptions,
    clientOptions
  );

  context.subscriptions.push(services.registLanguageClient(client));
}

