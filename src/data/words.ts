/** Programming words for Type mode practice. Symbols are excluded. */
export const PROGRAMMING_WORDS: readonly string[] = [
  "const", "let", "var", "function", "return", "async", "await", "import", "export",
  "default", "class", "extends", "implements", "interface", "type", "enum", "new",
  "this", "super", "static", "public", "private", "protected", "abstract", "readonly",
  "if", "else", "switch", "case", "break", "continue", "for", "while", "do", "of",
  "in", "try", "catch", "finally", "throw", "throws", "null", "undefined", "true",
  "false", "void", "never", "any", "unknown", "boolean", "number", "string", "object",
  "array", "map", "set", "promise", "record", "tuple", "union", "generic", "optional",
  "from", "as", "typeof", "instanceof", "keyof", "infer", "satisfies", "declare",
  "module", "namespace", "package", "require", "include", "using", "yield", "with",
  "user", "users", "request", "response", "error", "errors", "data", "result", "results",
  "config", "token", "query", "cache", "client", "server", "route", "router", "handler",
  "payload", "schema", "index", "component", "service", "database", "connection",
  "session", "cookie", "header", "headers", "body", "status", "code", "message",
  "timeout", "retry", "backoff", "queue", "task", "job", "worker", "event", "listener",
  "callback", "promise", "resolve", "reject", "then", "fetch", "axios", "http", "https",
  "api", "endpoint", "middleware", "controller", "model", "view", "store", "state",
  "props", "context", "hook", "ref", "effect", "memo", "reducer", "action", "dispatch",
  "render", "hydrate", "mount", "unmount", "update", "patch", "put", "post", "get",
  "delete", "create", "read", "write", "load", "save", "parse", "stringify", "serialize",
  "encode", "decode", "hash", "encrypt", "decrypt", "sign", "verify", "auth", "login",
  "logout", "signup", "password", "secret", "key", "keys", "value", "values", "id",
  "uuid", "slug", "name", "email", "input", "output", "file", "files", "path", "url",
  "uri", "host", "port", "domain", "origin", "proxy", "cors", "csrf", "jwt", "oauth",
  "json", "xml", "html", "css", "sql", "query", "select", "insert", "update", "where",
  "join", "group", "order", "limit", "offset", "count", "sum", "avg", "min", "max",
  "table", "column", "row", "index", "unique", "primary", "foreign", "constraint",
  "migration", "schema", "seed", "transaction", "commit", "rollback", "lock", "unlock",
  "git", "branch", "merge", "rebase", "checkout", "push", "pull", "clone", "commit",
  "diff", "stash", "tag", "remote", "origin", "main", "master", "feature", "hotfix",
  "npm", "pnpm", "yarn", "node", "deno", "bun", "install", "build", "test", "lint",
  "format", "watch", "start", "dev", "prod", "staging", "deploy", "release", "version",
  "docker", "compose", "image", "container", "volume", "network", "pod", "cluster",
  "kubernetes", "ci", "cd", "pipeline", "workflow", "job", "step", "artifact", "cache",
  "log", "logs", "debug", "info", "warn", "warning", "fatal", "trace", "span", "metric",
  "monitor", "alert", "health", "ready", "live", "uptime", "latency", "throughput",
  "refactor", "extract", "inline", "rename", "move", "fix", "bug", "issue", "ticket",
  "review", "approve", "comment", "docs", "readme", "changelog", "todo", "fixme",
  "validate", "sanitize", "normalize", "transform", "filter", "sort", "reduce", "find",
  "some", "every", "includes", "slice", "splice", "concat", "split", "join", "trim",
  "replace", "match", "search", "length", "size", "empty", "nullish", "optional",
  "default", "fallback", "guard", "assert", "expect", "mock", "stub", "spy", "fixture",
  "unit", "integration", "e2e", "coverage", "snapshot", "spec", "suite", "describe",
  "it", "before", "after", "setup", "teardown", "skip", "only", "todo", "fail", "pass",
  "async", "await", "sync", "parallel", "sequential", "debounce", "throttle", "memoize",
  "lazy", "eager", "stream", "buffer", "chunk", "pipe", "readable", "writable",
  "socket", "websocket", "grpc", "graphql", "rest", "rpc", "webhook", "cron", "schedule",
  "env", "config", "option", "flag", "arg", "args", "param", "params", "query", "body",
  "react", "vue", "svelte", "angular", "next", "nuxt", "express", "fastify", "nestjs",
  "prisma", "drizzle", "mongoose", "redis", "postgres", "mysql", "sqlite", "mongo",
  "typescript", "javascript", "python", "golang", "rust", "java", "kotlin", "swift",
  "php", "ruby", "elixir", "scala", "csharp", "cpp", "bash", "shell", "powershell",
  "compiler", "bundler", "parser", "lexer", "runtime", "interpreter", "virtual",
  "thread", "process", "fork", "spawn", "kill", "signal", "exit", "code", "stack",
  "heap", "memory", "leak", "overflow", "pointer", "reference", "copy", "clone",
  "immutable", "mutable", "pure", "side", "effect", "stateful", "stateless", "idempotent",
  "factory", "singleton", "adapter", "decorator", "observer", "strategy", "pattern",
  "algorithm", "binary", "tree", "graph", "list", "stack", "queue", "heap", "hashmap",
  "recursion", "iteration", "loop", "nested", "depth", "breadth", "sort", "search",
  "window", "document", "element", "node", "child", "parent", "sibling", "root",
  "className", "style", "theme", "dark", "light", "layout", "flex", "grid", "gap",
  "padding", "margin", "border", "width", "height", "scroll", "overflow", "hidden",
  "visible", "display", "position", "absolute", "relative", "fixed", "sticky", "zindex",
  "click", "submit", "change", "input", "focus", "blur", "keydown", "keyup", "resize",
  "loading", "pending", "success", "failure", "idle", "busy", "disabled", "enabled",
  "required", "optional", "invalid", "valid", "error", "warning", "info", "help",
  "admin", "guest", "owner", "member", "role", "permission", "scope", "access", "deny",
  "allow", "grant", "revoke", "policy", "rule", "filter", "guard", "firewall", "rate",
  "limit", "quota", "throttle", "burst", "retry", "timeout", "deadline", "cancel",
  "abort", "pause", "resume", "restart", "reload", "refresh", "invalidate", "expire",
  "ttl", "expires", "created", "updated", "deleted", "archived", "draft", "published",
];

export const ENGLISH_WORDS: readonly string[] = PROGRAMMING_WORDS;

export function pickWords(count: number, rng: () => number = Math.random): string[] {
  if (count <= 0) {
    return [];
  }
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    const index = Math.floor(rng() * PROGRAMMING_WORDS.length);
    words.push(PROGRAMMING_WORDS[index]!);
  }
  return words;
}

export function buildPrompt(wordCount: number, rng?: () => number): string {
  return pickWords(wordCount, rng).join(" ");
}
