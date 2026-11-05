export interface Example { input: string; output: string }
export type TestCategory = 'examples'|'additional'|'edge'|'restrictions';
export interface TestMetadata {id:string;name:string;category:TestCategory;objective:string;explanation:string;diagnosis:string;concept:string;version:string;source:string;seed?:number;generator?:string;parameters:unknown[]}
export interface TestCase extends Example { hidden?: boolean; local?: boolean; meta?:TestMetadata }
export interface Frame { title: string; cells: string[]; active: number[]; detail: string }
export interface Lesson {
  summary: string; rules: string[]; hints: [string,string,string]; strategy: string;
  concepts: string[]; mistakes: string[]; alternative: string; frames: Frame[];
}
export interface Exercise extends Lesson {
  id: string; level: number; name: string; file: string; signature: string;
  original: string; examples: Example[]; tests: TestCase[]; solution: string;
  version: string; source: string; status: string; restrictions: string[]; divergence: string;
}
export interface RecordData {code:string; passed:boolean; understood:boolean; comprehension?:'none'|'partial'|'understood'; attempts:number; best:number; total:number; hints:number; notes:string; seconds:number; errors:number; solutionViewed:boolean}
export interface Exam {id:string; start:number; duration:number; sequence:string[]; index:number; codes:Record<string,string>; attempts:number; ended?:number; reason?:string; reroll:boolean}
export interface Progress {schema:1; records:Record<string,RecordData>; exams:Exam[]; activeExam?:Exam; selected:string; settings:{fontSize:number; timeout:number; duration:number; reroll:boolean};history?:Attempt[]}
export type FailureKind='syntax'|'runtime'|'value'|'type'|'timeout'|'cancelled'|'restriction'|'internal'|'side_effect'|'mutation';
export interface Difference {path:string;expected:string;actual:string;reason:string}
export interface TestResult {id?:string;input:string;expected:string;actual:string;passed:boolean;hidden?:boolean;error?:string;stdout:string;stderr:string;status?:'passed'|'failed'|'error'|'timeout'|'cancelled'|'not_run';errorType?:FailureKind;actualAvailable?:boolean;actualType?:string;expectedType?:string;durationMs?:number;difference?:Difference;metadata?:TestMetadata}
export interface RestrictionCheck {id:string;name:string;passed:boolean;expected:string;actual:string;explanation:string;line?:number}
export interface VariableValue {type:string;repr:string;value?:unknown}
export interface TraceStep {index:number;line:number;event:'line'|'return'|'exception';function:string;variables:Record<string,VariableValue>;condition?:{line:number;expression:string;result:boolean};returnValue?:VariableValue}
export interface TraceReport {steps:TraceStep[];input:string;output:VariableValue;truncated:boolean;source:string}
export interface Execution {results:TestResult[];error?:string;errorType?:FailureKind;stdout?:string;stderr?:string;restriction?:string;durationMs?:number;checks?:RestrictionCheck[];planned?:number;trace?:TraceReport}
export interface Attempt {id:string;timestamp:number;exerciseId:string;examId?:string;kind:'grade'|'replay';code:string;exercise:Exercise;execution:Execution;cases?:TestCase[];seed?:number}
