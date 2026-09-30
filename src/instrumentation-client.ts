import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "./lib/sentry";

// Runs in the browser before the app becomes interactive.
Sentry.init(sentryOptions);
