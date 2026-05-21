import { Location } from "./location";

export interface IContentRow {
	parts: IContentPart[]
	locations?: string[][] | Location[]
}

export interface IContentPart {
	text: string;
	locations?: string[][] | Location[]
}