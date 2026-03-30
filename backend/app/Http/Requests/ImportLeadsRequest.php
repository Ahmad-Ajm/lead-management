<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ImportLeadsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'CSV file is required.',
            'file.file' => 'The uploaded input must be a file.',
            'file.mimes' => 'The file must be a CSV file.',
            'file.max' => 'The file may not be greater than 2MB.',
        ];
    }
}