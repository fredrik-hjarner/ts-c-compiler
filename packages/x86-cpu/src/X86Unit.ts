import { X86CPU } from './X86CPU';

/**
 * CPU Part
 */
export abstract class X86Unit {
  protected cpu: X86CPU;

  constructor(cpu: X86CPU) {
    console.log('X86Unit.constructor: typeof this:', typeof this);
    console.log('X86Unit.constructor: this.constructor.name:', this.constructor.name);
    console.log('X86Unit.constructor: keys of this:', Object.keys(this));
    this.cpu = cpu;
    this.init(cpu);
  }

  getCPU(): X86CPU {
    return this.cpu;
  }

  /**
   * Inits whole unit
   *
   * @todo
   *  Add release method?
   */
  protected abstract init(cpu: X86CPU): void;
}
