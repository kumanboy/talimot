import { NextRequest, NextResponse } from "next/server";
import { hasValidAdminSession } from "@/features/admin/model/admin-session";
import type { AdminDraftImageAsset } from "@/features/admin/tests/draft/model/admin-question-types";
import type { AdminTestImageBulkUploadErrorResponse, AdminTestImageBulkUploadRequestItem, AdminTestImageBulkUploadSuccessResponse } from "@/features/admin/tests/draft/model/admin-test-image-bulk-upload-types";
import { AdminTestImageValidationError, assertAdminTestImageOwnerId, createAdminTestImageStoragePath, getAdminTestImageExtension, normalizeAdminTestImageAlt, normalizeAdminTestImageCaption, normalizeAdminTestImageDimension, normalizeAdminTestImageMimeType, sanitizeAdminTestImageFileName, validateAdminTestImageSize } from "@/features/admin/tests/draft/model/admin-test-image-validation";
import { AdminTestImageStorageError, createAdminTestImageSignedUpload, getAdminTestImageBucket, getAdminTestImageStorageUrl } from "@/features/admin/tests/draft/storage/admin-test-image-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_FILES = 120;
const MAX_DECLARED_TOTAL_BYTES = 180 * 1024 * 1024;
function errorResponse(message:string,status:number):NextResponse<AdminTestImageBulkUploadErrorResponse>{return NextResponse.json({status:"error",message},{status});}
function readString(value:unknown):string{return typeof value === "string" ? value.trim() : "";}
function known(error:unknown):NextResponse<AdminTestImageBulkUploadErrorResponse>{if(error instanceof AdminTestImageValidationError)return errorResponse(error.message,400);if(error instanceof AdminTestImageStorageError)return errorResponse(error.message,502);console.error("Admin bulk image upload route failed.",error);return errorResponse("Rasm ZIP uchun xavfsiz yuklash manzillarini yaratib bo‘lmadi.",500);}
export async function POST(request:NextRequest):Promise<NextResponse>{
 if(!(await hasValidAdminSession())) return errorResponse("Admin sessiyasi tugagan. Qayta kiring.",401);
 try{
  const body=await request.json() as {readonly draftId?:unknown;readonly files?:unknown}; const draftId=readString(body.draftId); assertAdminTestImageOwnerId(draftId,"Draft ID");
  if(!Array.isArray(body.files)||body.files.length===0||body.files.length>MAX_FILES) throw new AdminTestImageValidationError(`Bir bulk rasm yuklashda 1–${MAX_FILES} ta fayl bo‘lishi kerak.`);
  const seenClientIds=new Set<string>(); const seenQuestionIds=new Set<string>(); let totalBytes=0;
  const prepared=(body.files as Partial<AdminTestImageBulkUploadRequestItem>[]).map((value)=>{
   const clientId=readString(value.clientId), questionId=readString(value.questionId), fileName=readString(value.fileName);
   assertAdminTestImageOwnerId(clientId,"Bulk rasm client ID"); assertAdminTestImageOwnerId(questionId,"Savol ID");
   if(seenClientIds.has(clientId)) throw new AdminTestImageValidationError("Bulk rasm client ID takrorlangan."); if(seenQuestionIds.has(questionId)) throw new AdminTestImageValidationError("Bitta savolga bir bulk yuklashda ikki rasm yuborib bo‘lmaydi."); seenClientIds.add(clientId); seenQuestionIds.add(questionId);
   const mimeType=normalizeAdminTestImageMimeType(readString(value.mimeType)); const sizeBytes=validateAdminTestImageSize(Number(value.sizeBytes)); totalBytes+=sizeBytes; if(totalBytes>MAX_DECLARED_TOTAL_BYTES) throw new AdminTestImageValidationError("Bulk rasmlarning umumiy hajmi 180 MB dan oshmasligi kerak.");
   const width=normalizeAdminTestImageDimension(value.width), height=normalizeAdminTestImageDimension(value.height), alt=normalizeAdminTestImageAlt(readString(value.alt)), caption=normalizeAdminTestImageCaption(readString(value.caption));
   const fileId=crypto.randomUUID(); const extension=getAdminTestImageExtension(mimeType); const storagePath=createAdminTestImageStoragePath({draftId,questionId,fileId,extension});
   const image:AdminDraftImageAsset={kind:"image",id:fileId,fileName:sanitizeAdminTestImageFileName(fileName,extension),mimeType,sizeBytes,width,height,storagePath,alt,caption};
   return {clientId,questionId,storagePath,image};
  });
  const signed=await Promise.all(prepared.map(async item=>({storagePath:item.storagePath,token:(await createAdminTestImageSignedUpload(item.storagePath)).token}))); const tokenByPath=new Map(signed.map(x=>[x.storagePath,x.token]));
  return NextResponse.json<AdminTestImageBulkUploadSuccessResponse>({status:"success",items:prepared.map(item=>({clientId:item.clientId,questionId:item.questionId,image:item.image,upload:{storageUrl:getAdminTestImageStorageUrl(),bucket:getAdminTestImageBucket(),path:item.storagePath,token:tokenByPath.get(item.storagePath)??""}}))});
 }catch(error){return known(error);}
}
