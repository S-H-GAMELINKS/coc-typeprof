import cp from 'child_process';
import fs from 'fs';
import { ExtensionContext, services, workspace, LanguageClientOptions, LanguageClient, Uri, window, ServerOptions } from 'coc.nvim'

function hasTyeProfInGemfileLock(): boolean {
  try {
    const gemfileLock = fs.readFileSync('Gemfile.lock', 'utf8');
    return gemfileLock.includes('typeprof');
  } catch {
    return false;
  }
}

function installedTypeProf(): Boolean {
  try {
    const result = cp.execSync('which typeprof', { stdio: 'pipe' }).toString();
    if (result.match('typeprof')) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}


function getServerOptions(): ServerOptions | null {
  if (hasTyeProfInGemfileLock()) {
    return {
      command: 'bundle',
      args: [
        'exec',
        'typeprof',
        '--stdio',
        '--lsp'
      ],
    }
  } else if (installedTypeProf()) {
    return {
      command: 'typeprof',
      args: [
        '--stdio',
	'--lsp'
      ]
    }
  } else {
    window.showMessage('TypeProf is not installed! Please install TypeProf!!');
    return null;
  }
}

export async function activate(context: ExtensionContext): Promise<void> {
  const serverOptions = getServerOptions();

  if (serverOptions == null) {
    return;
  }

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'ruby' },
      { scheme: 'file', language: 'rbs' },
    ],
    synchronize: {
      configurationSection: 'typeprof',
      fileEvents: workspace.createFileSystemWatcher('{**/*.rb,**/*.rbs}')
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

