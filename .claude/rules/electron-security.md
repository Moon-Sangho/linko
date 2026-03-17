# Electron Security Rules

Mandatory security settings for all Electron windows and IPC configuration.

---

## BrowserWindow Security Settings

All `BrowserWindow` instances must use these settings without exception:

```typescript
// ✅ Required webPreferences
new BrowserWindow({
  webPreferences: {
    contextIsolation: true,   // MUST be true
    nodeIntegration: false,   // MUST be false
    sandbox: true,            // MUST be true
    preload: path.join(__dirname, 'preload.js'),
  },
})
```

| Setting | Required Value | Why |
|---------|---------------|-----|
| `contextIsolation` | `true` | Prevents renderer from accessing main process context |
| `nodeIntegration` | `false` | Prevents Node.js APIs in renderer |
| `sandbox` | `true` | OS-level process isolation |

---

## IPC Channel Validation

Never trust renderer input blindly. Validate in handlers:

```typescript
// ✅ Validate before using
ipcMain.handle(IpcChannels.BOOKMARK_CREATE, async (_, input: unknown) => {
  if (!input || typeof input !== 'object') {
    return { success: false, error: 'Invalid input' }
  }
  // proceed
})
```

---

## Prohibited Patterns

```typescript
// ❌ Never expose remote module
const { remote } = require('electron')

// ❌ Never enable nodeIntegration
webPreferences: { nodeIntegration: true }

// ❌ Never disable contextIsolation
webPreferences: { contextIsolation: false }

// ❌ Never expose ipcRenderer directly
contextBridge.exposeInMainWorld('electron', { ipcRenderer })

// ❌ Never use webSecurity: false
webPreferences: { webSecurity: false }
```

---

## Security Checklist (verify before merge)

```
✅ contextIsolation: true  in all BrowserWindow instances
✅ nodeIntegration: false  in all BrowserWindow instances
✅ sandbox: true           in all BrowserWindow instances
✅ preload script used     for all IPC bridging
✅ No remote module usage  anywhere in codebase
✅ No direct ipcRenderer   exposed via contextBridge
✅ No webSecurity: false   anywhere
```
