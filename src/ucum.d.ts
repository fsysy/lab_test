declare module '@lhncbc/ucum-lhc' {
  export interface ConvertResult {
    status: 'succeeded' | 'failed' | 'error';
    toVal: number | null;
    msg: string[];
  }
  export interface ConvertOptions {
    molecularWeight?: number;
    charge?: number;
  }
  export class UcumLhcUtils {
    static getInstance(): UcumLhcUtils;
    convertUnitTo(from: string, val: number, to: string, options?: ConvertOptions): ConvertResult;
    validateUnitString(unit: string): { status: 'valid' | 'invalid' | 'error'; msg: string[] };
  }
}
