import fs from 'node:fs';

const path = 'src/App.tsx';
let app = fs.readFileSync(path, 'utf8');

const marker = `  useEffect(() => {\n    if (isDarkMode) {`;
if (!app.includes(marker)) throw new Error('Could not find insertion marker');

const effect = `  // Keep long-lived mobile/in-app browser tabs in sync with the latest deployed Vite bundle.\n  useEffect(() => {\n    let checking = false;\n\n    const checkForFreshBundle = async () => {\n      if (checking || document.visibilityState === 'hidden') return;\n      checking = true;\n      try {\n        const response = await fetch(\`/?__ui_check=\${Date.now()}\`, { cache: 'no-store' });\n        if (!response.ok) return;\n        const html = await response.text();\n        const latestMatch = html.match(/<script[^>]+src=[\"']([^\"']+\\.js)[\"']/i);\n        const currentScript = document.querySelector<HTMLScriptElement>('script[type=\"module\"][src]')?.getAttribute('src');\n        const latestScript = latestMatch?.[1];\n\n        if (latestScript && currentScript && latestScript !== currentScript) {\n          const freshUrl = new URL(window.location.href);\n          freshUrl.searchParams.set('__ui_v', latestScript);\n          window.location.replace(freshUrl.toString());\n        }\n      } catch (error) {\n        console.warn('UI freshness check failed', error);\n      } finally {\n        checking = false;\n      }\n    };\n\n    const handleVisibility = () => {\n      if (document.visibilityState === 'visible') void checkForFreshBundle();\n    };\n\n    window.addEventListener('focus', checkForFreshBundle);\n    document.addEventListener('visibilitychange', handleVisibility);\n    const timer = window.setInterval(checkForFreshBundle, 60_000);\n    void checkForFreshBundle();\n\n    return () => {\n      window.removeEventListener('focus', checkForFreshBundle);\n      document.removeEventListener('visibilitychange', handleVisibility);\n      window.clearInterval(timer);\n    };\n  }, []);\n\n`;

app = app.replace(marker, effect + marker);
fs.writeFileSync(path, app);
console.log('Inserted stale UI auto-refresh effect');
