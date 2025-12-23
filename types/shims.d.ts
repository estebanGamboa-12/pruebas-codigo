// Minimal type shims to allow type-checking without installed packages.
// These definitions are intentionally lightweight and cover only the APIs
// used by this project.

declare module 'react' {
  export type ReactNode = any;
  export type FC<P = {}> = (props: P & { children?: ReactNode }) => ReactNode | null;
  export type FormEvent = any;
  export type ChangeEvent<T = any> = { target: T } & Event;
  export function useState<S>(initialState: S | (() => S)): [S, (value: S | ((prev: S) => S)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useRef<T>(initialValue: T | null): { current: T | null };
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react-dom' {
  export const createPortal: (...args: any[]) => any;
}

declare module 'next' {
  export type Metadata = Record<string, any>;
}

declare module 'next/link' {
  const Link: (props: { href: string; className?: string; prefetch?: boolean; children?: any }) => any;
  export default Link;
}

declare module 'react-qr-code' {
  const QRCode: (props: { value: string; size?: number; bgColor?: string; fgColor?: string }) => any;
  export default QRCode;
}

declare module 'html5-qrcode' {
  export class Html5Qrcode {
    constructor(elementId: string);
    start(
      cameraConfig: any,
      config: any,
      onSuccess: (decodedText: string) => void,
      onError: (error: any) => void
    ): Promise<void>;
    stop(): Promise<void>;
    clear(): void;
  }
}

declare module '@supabase/supabase-js' {
  type SupabaseResult = Promise<{ data: any; error: { message: string } | null }>;

  export interface SupabaseAuthClient {
    getUser(jwt?: string): Promise<{ data: { user: any | null }; error?: { message: string } | null }>;
    getSession(): Promise<{ data: { session: any } }>;
    onAuthStateChange(
      callback: (event: any, session: any) => void
    ): { data: { subscription: { unsubscribe(): void } } };
    signInWithPassword(params: { email: string; password: string }): Promise<{ error: { message: string } | null }>;
    signOut(): Promise<void>;
  }

  export interface SupabaseQueryBuilder {
    select(columns?: string): this & Promise<{ data: any; error: { message: string } | null }>; // simplified chaining support
      update(values: any): this & Promise<{ data: any; error: { message: string } | null }>;
    insert(values: any): Promise<{ error: { message: string } | null }>;
    order(column: string, options?: any): this;
    eq(column: string, value: any): this;
    is(column: string, value: any): this;
    maybeSingle(): Promise<{ data: any; error: { message: string } | null }>;  
  }

  export interface SupabaseClient {
    auth: SupabaseAuthClient;
    from(table: string): SupabaseQueryBuilder;
  }

  export function createClient(url: string, key: string, options?: any): SupabaseClient;
}
