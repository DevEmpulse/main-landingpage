
declare module 'astro-particles' {
  import { type ISourceOptions } from '@tsparticles/engine';

  interface ParticlesProps {
    id: string;
    options?: ISourceOptions;
    init?: string;
    loaded?: string;
    [key: string]: any;
  }

  const Particles: (props: ParticlesProps) => any;
  export default Particles;
}