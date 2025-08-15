declare module '@tsparticles/engine' {
    export interface Container {
      destroy(): void;
      refresh(): Promise<void>;
    }
  
    export interface Engine {
      addShape(shape: string, drawer: any): void;
    }
  
    export interface ISourceOptions {
      background?: {
        color?: string | { value: string };
      };
      fullScreen?: {
        enable?: boolean;
        zIndex?: number;
      };
      particles?: {
        number?: {
          value?: number;
          density?: {
            enable?: boolean;
            value_area?: number;
          };
        };
        color?: {
          value?: string | string[];
        };
        move?: {
          enable?: boolean;
          speed?: number;
        };
        links?: {
          enable?: boolean;
          distance?: number;
          color?: string | { value: string };
          opacity?: number;
          width?: number;
        };
        [key: string]: any;
      };
    }
  
    export const tsParticles: {
      load: (id: string, options: ISourceOptions) => Promise<Container | undefined>;
    };
  }
  
  declare module '@tsparticles/slim' {
    export function loadSlim(engine: import('@tsparticles/engine').Engine): Promise<void>;
  }
  
  declare global {
    interface Window {
      particlesInit?: (engine: import('@tsparticles/engine').Engine) => Promise<void>;
      particlesLoaded?: (container: import('@tsparticles/engine').Container) => void;
    }
  }