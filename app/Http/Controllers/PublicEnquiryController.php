<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class PublicEnquiryController extends Controller
{
    public function registration(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'parent_name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'child_name' => ['required', 'string', 'max:120'],
            'child_age' => ['required', 'string', 'max:40'],
            'programme' => ['required', 'string', 'max:120'],
            'message' => ['nullable', 'string', 'max:3000'],
            'website' => ['nullable', 'max:0'],
        ]);

        $body = "New registration enquiry\n\n"
            . "Parent/guardian: {$data['parent_name']}\n"
            . "Email: {$data['email']}\nPhone: {$data['phone']}\n"
            . "Child: {$data['child_name']}\nAge: {$data['child_age']}\n"
            . "Interested in: {$data['programme']}\n\n"
            . "Message:\n" . ($data['message'] ?? '(none)');

        $this->send('Tinta Tots - Registration enquiry', $body, $data['email'], $data['parent_name']);

        return back()->with('enquiry_success', 'Your registration enquiry has been sent. Our team will contact you soon.');
    }

    public function career(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'position' => ['required', 'string', 'max:120'],
            'experience' => ['nullable', 'string', 'max:3000'],
            'message' => ['required', 'string', 'max:3000'],
            'website' => ['nullable', 'max:0'],
        ]);

        $body = "New career enquiry\n\n"
            . "Name: {$data['name']}\nEmail: {$data['email']}\n"
            . "Phone: {$data['phone']}\nInterested role: {$data['position']}\n\n"
            . "Experience:\n" . ($data['experience'] ?? '(none)') . "\n\n"
            . "Message:\n{$data['message']}";

        $this->send('Tinta Tots - Career enquiry', $body, $data['email'], $data['name']);

        return back()->with('enquiry_success', 'Your career enquiry has been sent. Thank you for reaching out.');
    }

    private function send(string $subject, string $body, string $email, string $name): void
    {
        // Log and array mailers do not deliver messages to an inbox.
        if (in_array(config('mail.default'), ['log', 'array'], true)) {
            throw ValidationException::withMessages([
                'email' => 'Email delivery is not configured yet. Please contact the centre by phone.',
            ]);
        }

        try {
            Mail::raw($body, function ($message) use ($subject, $email, $name) {
                $message->to('smartkids.system@gmail.com')
                    ->replyTo($email, trim(preg_replace('/[\r\n]+/', ' ', $name)))
                    ->subject($subject);
            });
        } catch (\Throwable $exception) {
            report($exception);
            throw ValidationException::withMessages([
                'email' => 'The enquiry could not be sent right now. Please try again later or call the centre.',
            ]);
        }
    }
}
