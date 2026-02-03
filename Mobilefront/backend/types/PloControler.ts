export type CloMapping = {
    cloId: number;
    cloCode: string;
    syllabusId: number;
    courseCode: string;
    mappingLevel: string;
}
export type PloControler = {
    ploId: number;
    programId: number;
    ploCode: string;
    ploDescription: string;
    totalMappedCLOS: number;
    cloMappings: CloMapping[];

}