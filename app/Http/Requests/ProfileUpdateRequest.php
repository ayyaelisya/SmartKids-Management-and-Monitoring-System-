<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        $rules = [
            'full_name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->user()->user_id, 'user_id'),
                Rule::when($this->user()->role !== 'admin',
                    Rule::notIn(['smartkids.system@gmail.com'])),
            ],
            'phone_number' => ['nullable', 'string', 'max:20'],
        ];

        if ($this->user()->role === 'teacher') {
            $rules['qualification'] = ['nullable', 'string', 'max:255'];
            $rules['address'] = ['nullable', 'string', 'max:500'];
        }

        if ($this->user()->role === 'parent') {
            $rules['relationship'] = ['required', Rule::in(['father', 'mother', 'guardian'])];
            $rules['address'] = ['nullable', 'string', 'max:500'];
        }

        return $rules;
    }
}
