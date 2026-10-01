import { ParsedToolCall, ToolSchema, NeedleAdapter } from './types';
import { DesktopContext } from '@/lib/types';

/**
 * LocalNeedleAdapter — rule-based natural-language → tool-call parser.
 *
 * Fully Screen- and Context-Aware:
 * Understands what is in front of the user (active app, open note,
 * browser state, window hierarchy, deictic references like "this",
 * "here", "current", "what's on screen", "close this", "read this").
 */
export class LocalNeedleAdapter implements NeedleAdapter {
  async parseCommand(
    input: string,
    _availableTools: ToolSchema[],
    context?: DesktopContext,
  ): Promise<ParsedToolCall[]> {
    const calls: ParsedToolCall[] = [];

    // ── 1. Protect quoted strings ───────────────────────────────
    const strings: string[] = [];
    const processed = input.replace(/["'“](.*?)["'”]/g, (_m, content) => {
      strings.push(content);
      return `__STR_${strings.length - 1}__`;
    });

    const restore = (t: string) =>
      t.replace(/__STR_(\d+)__/g, (_m, i) => strings[parseInt(i, 10)]);

    // ── 2. Split compound commands ──────────────────────────────
    const parts = processed
      .split(
        /\s+then\s+|\s+and\s+then\s+|,\s*then\s+|,\s*and\s+|,\s+|\.\s+|\s+and\s+(?=(?:open|launch|start|create|make|write|type|insert|save|search|look|close|minimize|rename|move|delete|switch|read|go)\b)/i,
      )
      .map((p) => p.trim())
      .filter(Boolean);

    // ── helpers ─────────────────────────────────────────────────
    const resolveAppId = (text: string): string | null => {
      const l = text.toLowerCase();
      if (/\b(editor|text\s*editor|notepad|notes?)\b/.test(l)) return 'text-editor';
      if (/\b(file\s*manager|files|explorer|finder|folders?)\b/.test(l))
        return 'file-manager';
      if (/\b(browser|web|internet|chrome|safari)\b/.test(l)) return 'browser';
      if (/\b(settings?|options?|preferences?)\b/.test(l)) return 'settings';
      return null;
    };

    const extractName = (raw: string): string => {
      const m = raw.match(
        /(?:called|named|as)\s+([a-zA-Z0-9_./-]+)/i,
      );
      if (m) return m[1];
      // fallback: last token that looks like a filename / folder name
      const tokens = raw.split(/\s+/);
      for (let i = tokens.length - 1; i >= 0; i--) {
        if (/[a-zA-Z0-9_]/.test(tokens[i]) && !/^(a|an|the|new|file|folder|directory|it|into|in|to|from)$/i.test(tokens[i])) {
          return tokens[i];
        }
      }
      return 'untitled';
    };

    const ensurePath = (name: string) =>
      name.startsWith('/') ? name : `/${name}`;

    // ── 3. Match each sub-command ───────────────────────────────
    for (const rawPart of parts) {
      const part = restore(rawPart);
      const low = part.toLowerCase();

      // ─── 0. SCREEN & CONTEXT AWARENESS ("What is in front of me") ───
      if (
        /\b(what('s| is) (in front of me|on (my )?screen|open)|what am i looking at|inspect (the )?screen|show (me )?screen state|screen summary)\b/i.test(low) ||
        low === 'what is in front' ||
        low === 'what is on screen' ||
        low === "what's in front" ||
        low === "what's on my screen"
      ) {
        calls.push({ name: 'inspect_screen', arguments: {} });
        continue;
      }

      // ─── Contextual Reading ("Read this file", "What does this note say") ───
      if (
        /\b(read (this|current|the open|the active)( note| file)?|what (does|is) (in )?(this|the open|the active|current) (note|file|document) (say|contain|have)|summarize (this|the open|current) (note|file))\b/i.test(low)
      ) {
        if (context?.editor?.isOpen || context?.editor?.content) {
          calls.push({ name: 'get_editor_content', arguments: {} });
          continue;
        } else if (context?.activeApp === 'text-editor') {
          calls.push({ name: 'get_editor_content', arguments: {} });
          continue;
        } else {
          calls.push({ name: 'inspect_screen', arguments: {} });
          continue;
        }
      }

      // ─── Contextual Close ("Close this", "Close current window", "Close it") ───
      if (
        /\b(close|quit|exit)\s+(this|it|current|the active window|the current window|active app)\b/i.test(low) ||
        low === 'close this' ||
        low === 'close it'
      ) {
        if (context?.activeApp) {
          calls.push({ name: 'close_app', arguments: { app: context.activeApp } });
          continue;
        } else if (context?.openWindows && context.openWindows.length > 0) {
          const lastWin = context.openWindows[context.openWindows.length - 1];
          calls.push({ name: 'close_app', arguments: { app: lastWin.appId } });
          continue;
        }
      }

      // ─── Contextual Minimize ("Minimize this", "Minimize current") ───
      if (
        /\b(minimize)\s+(this|it|current|the active window|the current window|active app)\b/i.test(low) ||
        low === 'minimize this' ||
        low === 'minimize it'
      ) {
        if (context?.activeApp) {
          calls.push({ name: 'minimize_app', arguments: { app: context.activeApp } });
          continue;
        }
      }

      // ─── Contextual Save ("Save this", "Save current note") ───
      if (
        /\bsave\s+(this|it|current|this note|the note|the file)\b/i.test(low) ||
        low === 'save this' ||
        low === 'save note'
      ) {
        calls.push({ name: 'save_file', arguments: {} });
        continue;
      }

      // ─── Contextual Search ("Search what is in this note") ───
      if (
        /\bsearch\s+(what is in this (note|file)|this note|the current note|contents? of this note)\b/i.test(low)
      ) {
        const query = context?.editor?.content
          ? context.editor.content.split('\n')[0].substring(0, 50).trim()
          : (context?.editor?.activeFileName || 'NeedleOS');
        calls.push({ name: 'search', arguments: { query: query || 'NeedleOS' } });
        continue;
      }

      // ─── Contextual Insert ("Type ... here / in this note / into this file") ───
      if (
        /\b(type|write|insert|add|append)\s+(.+?)\s+(here|in this( note| file)?|into this( note| file)?|at the bottom)\b/i.test(low)
      ) {
        const m = part.match(/(?:type|write|insert|add|append)\s+(.+?)\s+(?:here|in this|into this|at the bottom)/i);
        if (m) {
          const content = restore(m[1].trim());
          calls.push({ name: 'insert_text', arguments: { text: content } });
          continue;
        }
      }

      // ─── Open browser ─────────────────────────────────────────
      if (/\b(open|launch|start)\b.*\bbrowser\b/i.test(low)) {
        calls.push({ name: 'open_browser', arguments: {} });
        continue;
      }

      // ─── Focus / switch to app ────────────────────────────────
      if (/\b(switch to|focus|bring to front)\b/i.test(low)) {
        const appId = resolveAppId(low);
        if (appId) {
          calls.push({ name: 'focus_app', arguments: { app: appId } });
          continue;
        }
      }

      // ─── Open app ─────────────────────────────────────────────
      if (/\b(open|launch|start)\b/i.test(low)) {
        const appId = resolveAppId(low);
        if (appId) {
          calls.push({ name: 'open_app', arguments: { app: appId } });
          continue;
        }
        // might be "open <filename>"
        const fileMatch = part.match(/\b(?:open)\s+([a-zA-Z0-9_./-]+)/i);
        if (fileMatch) {
          const path = ensurePath(fileMatch[1]);
          calls.push({ name: 'open_editor', arguments: { path } });
          continue;
        }
      }

      // ─── Close app ────────────────────────────────────────────
      if (/\b(close|quit|exit)\b/i.test(low)) {
        const appId = resolveAppId(low);
        if (appId) {
          calls.push({ name: 'close_app', arguments: { app: appId } });
          continue;
        }
      }

      // ─── Minimize app ─────────────────────────────────────────
      if (/\bminimize\b/i.test(low)) {
        const appId = resolveAppId(low);
        if (appId) {
          calls.push({ name: 'minimize_app', arguments: { app: appId } });
          continue;
        }
      }

      // ─── Create folder ────────────────────────────────────────
      if (/\b(create|make|new)\b.*\b(folder|directory)\b/i.test(low)) {
        const name = extractName(part);
        calls.push({ name: 'create_folder', arguments: { path: ensurePath(name) } });
        continue;
      }

      // ─── Create file ──────────────────────────────────────────
      if (/\b(create|make|new)\b.*\b(file)?\b/i.test(low) && /[a-zA-Z0-9_]+\.[a-zA-Z]+/.test(part)) {
        const fileMatch = part.match(/([a-zA-Z0-9_/.'-]+\.[a-zA-Z]+)/);
        const name = fileMatch ? fileMatch[1] : extractName(part);
        calls.push({ name: 'create_file', arguments: { path: ensurePath(name) } });
        continue;
      }

      // ─── Rename file/folder ───────────────────────────────────
      if (/\brename\b/i.test(low)) {
        const m = part.match(
          /rename\s+([a-zA-Z0-9_./-]+)\s+(?:to|as)\s+([a-zA-Z0-9_./-]+)/i,
        );
        if (m) {
          const from = ensurePath(m[1]);
          const to = ensurePath(m[2]);
          calls.push({ name: 'rename_file', arguments: { from, to } });
          continue;
        }
      }

      // ─── Move file ────────────────────────────────────────────
      if (/\bmove\b/i.test(low)) {
        const m = part.match(
          /move\s+([a-zA-Z0-9_./-]+)\s+(?:to|into)\s+([a-zA-Z0-9_./-]+)/i,
        );
        if (m) {
          const from = ensurePath(m[1]);
          const to = ensurePath(m[2]);
          calls.push({ name: 'move_file', arguments: { from, to } });
          continue;
        }
      }

      // ─── Delete file ──────────────────────────────────────────
      if (/\b(delete|remove)\b/i.test(low)) {
        const m = part.match(/(?:delete|remove)\s+(?:the\s+)?([a-zA-Z0-9_./-]+)/i);
        if (m) {
          calls.push({ name: 'delete_file', arguments: { path: ensurePath(m[1]) } });
          continue;
        }
      }

      // ─── Write / type / insert text ───────────────────────────
      if (/\b(write|type|insert|add)\b/i.test(low)) {
        // Strip trailing 'into the file' or 'in the file' if present
        const cleanedPart = part.replace(/\s+(?:in(?:to)?\s+(?:the\s+)?file)$/i, '');
        const m = cleanedPart.match(
          /(?:write|type|insert|add)\s+(?:the\s+)?(?:text\s+)?(?:in(?:to)?\s+(?:the\s+)?(?:file\s+)?)?(.+)/i,
        );
        if (m) {
          const content = restore(m[1].trim());
          calls.push({ name: 'insert_text', arguments: { text: content } });
          continue;
        }
      }

      // ─── Replace text ─────────────────────────────────────────
      if (/\breplace\b/i.test(low)) {
        const m = part.match(/replace\s+(?:the\s+)?(?:content(?:s)?\s+)?(?:with\s+)?(.+)/i);
        if (m) {
          const content = restore(m[1].trim());
          calls.push({ name: 'replace_text', arguments: { text: content } });
          continue;
        }
      }

      // ─── Save ─────────────────────────────────────────────────
      if (/\bsave\s*(it|the\s+file|file)?\s*$/i.test(low) || low === 'save') {
        calls.push({ name: 'save_file', arguments: {} });
        continue;
      }

      // ─── Save as ──────────────────────────────────────────────
      if (/\bsave\s+as\b/i.test(low)) {
        const m = part.match(/save\s+as\s+([a-zA-Z0-9_./-]+)/i);
        if (m) {
          calls.push({ name: 'save_as', arguments: { path: ensurePath(m[1]) } });
        }
        continue;
      }

      // ─── Search ───────────────────────────────────────────────
      if (/\b(search|look\s+up|find)\b/i.test(low) && !/file|folder/i.test(low)) {
        const m = part.match(/(?:search|look\s+up|find)\s+(?:for\s+)?(.+)/i);
        if (m) {
          const query = restore(m[1].trim());
          calls.push({ name: 'search', arguments: { query } });
          continue;
        }
      }

      // ─── Navigate to URL ──────────────────────────────────────
      if (/\b(go\s+to|navigate\s+to|visit)\b/i.test(low)) {
        const m = part.match(/(?:go\s+to|navigate\s+to|visit)\s+(.+)/i);
        if (m) {
          const url = restore(m[1].trim());
          calls.push({ name: 'navigate', arguments: { url } });
          continue;
        }
      }

      // ─── Go back ──────────────────────────────────────────────
      if (/\bgo\s*back\b/i.test(low)) {
        calls.push({ name: 'go_back', arguments: {} });
        continue;
      }

      // ─── System: time ─────────────────────────────────────────
      if (/\b(what\s+time|current\s+time|time\s+is\s+it)\b/i.test(low)) {
        calls.push({ name: 'get_time', arguments: {} });
        continue;
      }

      // ─── System: info ─────────────────────────────────────────
      if (/\b(system\s+info|about\s+system)\b/i.test(low)) {
        calls.push({ name: 'get_system_info', arguments: {} });
        continue;
      }

      // ─── Reset desktop ────────────────────────────────────────
      if (/\breset\b/i.test(low)) {
        calls.push({ name: 'reset_desktop', arguments: {} });
        continue;
      }

      // ─── List files ───────────────────────────────────────────
      if (/\b(list|show|ls|dir)\b.*\b(files?|folder|directory|contents?)\b/i.test(low)) {
        const m = part.match(/(?:in|of|at)\s+([a-zA-Z0-9_./-]+)/i);
        const path = m ? ensurePath(m[1]) : '/';
        calls.push({ name: 'list_files', arguments: { path } });
        continue;
      }

      // ─── Read file ────────────────────────────────────────────
      if (/\b(read|cat|show|display)\b.*\b([a-zA-Z0-9_]+\.[a-zA-Z]+)\b/i.test(low)) {
        const m = part.match(/([a-zA-Z0-9_./-]+\.[a-zA-Z]+)/i);
        if (m) {
          calls.push({ name: 'read_file', arguments: { path: ensurePath(m[1]) } });
          continue;
        }
      }
    }

    return calls;
  }
}

export const needleAdapter = new LocalNeedleAdapter();
