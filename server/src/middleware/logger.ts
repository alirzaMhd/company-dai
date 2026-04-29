const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  debug: (msg: string, ...args: any[]) => {
    if (isDev) console.debug(`[DEBUG] ${new Date().toISOString()} - ${msg}`, ...args);
  },
  info: (msg: string, ...args: any[]) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, ...args);
  },
  warn: (msg: string, ...args: any[]) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, ...args);
  },
  error: (msg: string, ...args: any[]) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, ...args);
  },
};

export const httpLogger = {
  // Basic HTTP logging middleware
  log: (req: any, res: any, next: any) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.url} ${res.statusCode} (${duration}ms)`);
    });
    next();
  },
};