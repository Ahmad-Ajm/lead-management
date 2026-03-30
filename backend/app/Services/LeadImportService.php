<?php

namespace App\Services;

use App\Models\Lead;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;

class LeadImportService
{
    public function import(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');

        if ($handle === false) {
            return [
                'total_rows' => 0,
                'imported_count' => 0,
                'skipped_count' => 0,
                'errors' => [
                    ['row' => null, 'message' => 'Could not open uploaded CSV file.'],
                ],
            ];
        }

        $header = fgetcsv($handle);

        if ($header === false) {
            fclose($handle);

            return [
                'total_rows' => 0,
                'imported_count' => 0,
                'skipped_count' => 0,
                'errors' => [
                    ['row' => null, 'message' => 'CSV file is empty or missing a header row.'],
                ],
            ];
        }

        $header = array_map(fn ($value) => trim((string) $value), $header);

        $totalRows = 0;
        $importedCount = 0;
        $skippedCount = 0;
        $errors = [];

        while (($row = fgetcsv($handle)) !== false) {
            $totalRows++;

            if ($this->isEmptyRow($row)) {
                $skippedCount++;
                continue;
            }

            $rowData = $this->mapRowToHeader($header, $row);

            $validator = Validator::make($rowData, [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['nullable', 'email', 'unique:leads,email'],
                'phone' => ['nullable', 'string', 'max:50'],
                'source' => ['required', 'in:facebook,whatsapp,website,manual'],
                'stage' => ['required', 'in:new,contacted,follow_up,assigned,converted,lost'],
                'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
                'notes' => ['nullable', 'string'],
            ]);

            if ($validator->fails()) {
                $skippedCount++;

                $errors[] = [
                    'row' => $totalRows + 1,
                    'message' => $validator->errors()->first(),
                ];

                continue;
            }

            $validated = $validator->validated();

            Lead::create([
                'name' => $validated['name'],
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'source' => $validated['source'],
                'stage' => $validated['stage'],
                'assigned_to' => $validated['assigned_to'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'metadata' => [
                    'imported' => true,
                    'imported_via' => 'csv',
                ],
            ]);

            $importedCount++;
        }

        fclose($handle);

        return [
            'total_rows' => $totalRows,
            'imported_count' => $importedCount,
            'skipped_count' => $skippedCount,
            'errors' => $errors,
        ];
    }

    private function mapRowToHeader(array $header, array $row): array
    {
        $mapped = [];

        foreach ($header as $index => $column) {
            $mapped[$column] = array_key_exists($index, $row)
                ? $this->normalizeValue($row[$index])
                : null;
        }

        return $mapped;
    }

    private function normalizeValue(mixed $value): mixed
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim((string) $value);

        return $trimmed === '' ? null : $trimmed;
    }

    private function isEmptyRow(array $row): bool
    {
        foreach ($row as $value) {
            if (trim((string) $value) !== '') {
                return false;
            }
        }

        return true;
    }
}