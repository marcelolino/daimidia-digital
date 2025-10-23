import Papa from "papaparse";
import type { Media, Category } from "@shared/schema";

export interface MediaExportData {
  id: string;
  título: string;
  descrição: string;
  tipo: string;
  categoria: string;
  tags: string;
  arquivo: string;
  tamanho: string;
  formato: string;
  "data de criação": string;
}

export function prepareMediaForExport(
  mediaList: Media[],
  categories: Category[] = []
): MediaExportData[] {
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));

  return mediaList.map((media) => ({
    id: media.id,
    título: media.title,
    descrição: media.description || "",
    tipo: media.type,
    categoria: media.categoryId ? categoryMap.get(media.categoryId) || "Sem categoria" : "Sem categoria",
    tags: media.tags?.join(", ") || "",
    arquivo: media.fileName,
    tamanho: media.fileSize || "",
    formato: media.mimeType || "",
    "data de criação": new Date(media.createdAt).toLocaleString("pt-BR"),
  }));
}

export function downloadCSV(data: MediaExportData[], filename: string = "biblioteca-midia") {
  const csv = Papa.unparse(data, {
    delimiter: ",",
    header: true,
  });

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadExcel(data: MediaExportData[], filename: string = "biblioteca-midia") {
  const headers = Object.keys(data[0] || {});
  const rows = data.map((row) => Object.values(row));

  let csvContent = headers.join("\t") + "\n";
  rows.forEach((row) => {
    csvContent += row.map((cell) => String(cell).replace(/\t/g, " ")).join("\t") + "\n";
  });

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.xls`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
