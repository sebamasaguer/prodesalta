import { api } from "./client";
import type {
  FixtureImportCommitResponse,
  FixtureImportPreviewResponse,
} from "../types/fixtureImport";

export async function downloadFixtureTemplate(): Promise<void> {
  const response = await api.get("/fixture-import/template", {
    responseType: "blob",
  });

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "plantilla_fixture_prode.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

export async function previewFixtureImport(
  file: File,
): Promise<FixtureImportPreviewResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<FixtureImportPreviewResponse>(
    "/fixture-import/preview",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

export async function commitFixtureImport(
  file: File,
): Promise<FixtureImportCommitResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<FixtureImportCommitResponse>(
    "/fixture-import/commit",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}