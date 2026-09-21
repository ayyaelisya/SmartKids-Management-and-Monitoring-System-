<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Receipt - {{ $invoiceRef }}</title>

    <style>
        @page {
            margin: 40px 40px;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 13px;
            color: #333333;
            line-height: 1.4;
        }

        .header-table {
            width: 100%;
            margin-bottom: 25px;
        }

        .logo {
            max-width: 130px;
            height: auto;
        }

        .company-details {
            text-align: right;
            font-size: 12px;
            color: #555555;
            line-height: 1.5;
        }

        .company-title {
            font-size: 16px;
            font-weight: bold;
            color: #8b1e3f;
            margin-bottom: 4px;
        }

        .title-receipt {
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 1px;
            color: #222222;
            margin-bottom: 20px;
        }

        .info-table {
            width: 100%;
            margin-bottom: 30px;
        }

        .info-table td {
            vertical-align: top;
        }

        .section-label {
            color: #8b1e3f;
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 5px;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .items-table th {
            border-bottom: 2px solid #8b1e3f;
            text-align: left;
            padding: 8px 5px;
            color: #8b1e3f;
            font-size: 12px;
        }

        .items-table td {
            border-bottom: 1px solid #eeeeee;
            padding: 10px 5px;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .summary-table {
            width: 40%;
            margin-left: auto;
            border-collapse: collapse;
        }

        .summary-table td {
            padding: 6px 5px;
        }

        .summary-total {
            font-size: 15px;
            font-weight: bold;
            border-top: 2px solid #8b1e3f;
            border-bottom: 2px solid #8b1e3f;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 10px;
            background-color: #28a745;
            color: #ffffff;
            font-weight: bold;
            border-radius: 4px;
            font-size: 11px;
        }

        .notes-section {
            margin-top: 40px;
            font-size: 11px;
            color: #666666;
            border-top: 1px dashed #cccccc;
            padding-top: 15px;
        }

        .notes-section p {
            margin: 5px 0;
        }

        .email {
            margin-top: 3px;
        }
    </style>
</head>

<body>

    <!-- Header -->
    <table class="header-table">
        <tr>
            <td style="width: 45%; vertical-align: top;">
                <img
                    src="{{ public_path('images/logo.jpg') }}"
                    class="logo"
                    alt="Tinta Tots Clubhouse Logo"
                >
            </td>

            <td class="company-details" style="width: 55%;">
                <div class="company-title">
                    Tinta Tots Clubhouse
                </div>

                <div>
                    Tinta Residensi, Jalan Bidara 4,
                </div>

                <div>
                    Taman Nada Bidara, Labu,
                </div>

                <div>
                    Negeri Sembilan
                </div>

                <div class="email">
                    Email: tintatotsclubhouse@gmail.com
                </div>
            </td>
        </tr>
    </table>

    <!-- Receipt Title -->
    <div class="title-receipt">
        RECEIPT
    </div>

    <!-- Payment Information -->
    <table class="info-table">
        <tr>

            <!-- Parent and Student Information -->
            <td style="width: 45%;">
                <div class="section-label">
                    Billed To
                </div>

                <strong>{{ $parentName }}</strong>
                <br>

                Student: {{ $studentName }}
                <br>

                Class: {{ $className }}
            </td>

            <!-- Invoice Information -->
            <td style="width: 27%;">
                <div class="section-label">
                    Date Issued
                </div>

                {{ $paymentDate }}

                <br><br>

                <div class="section-label">
                    Invoice Reference
                </div>

                {{ $invoiceRef }}
            </td>

            <!-- Payment Status -->
            <td
                style="width: 28%;"
                class="text-right"
            >
                <div class="section-label">
                    Payment Status
                </div>

                <span class="status-badge">
                    PAID
                </span>

                <br><br>

                <div class="section-label">
                    Amount Paid
                </div>

                <span
                    style="
                        font-size: 16px;
                        font-weight: bold;
                    "
                >
                    RM {{ number_format($amountPaid, 2) }}
                </span>
            </td>

        </tr>
    </table>

    <!-- Fee Details -->
    <table class="items-table">

        <thead>
            <tr>
                <th>
                    Description
                </th>

                <th
                    class="text-center"
                    style="width: 10%;"
                >
                    Qty
                </th>

                <th
                    class="text-right"
                    style="width: 20%;"
                >
                    Rate (RM)
                </th>

                <th
                    class="text-right"
                    style="width: 20%;"
                >
                    Amount (RM)
                </th>
            </tr>
        </thead>

        <tbody>

            <!-- Monthly Package Fee -->
            <tr>
                <td>
                    <strong>
                        Monthly Fee - {{ $billingMonth }}
                    </strong>

                    <br>

                    <small style="color: #666666;">
                        Monthly Package Fee
                    </small>
                </td>

                <td class="text-center">
                    1
                </td>

                <td class="text-right">
                    {{ number_format($baseFee, 2) }}
                </td>

                <td class="text-right">
                    {{ number_format($baseFee, 2) }}
                </td>
            </tr>

            <!-- Late Pickup Fee -->
            @if($latePickupFee > 0)
                <tr>
                    <td>
                        <strong>
                            Late Pickup Fee
                        </strong>

                        <br>

                        <small style="color: #666666;">
                            Accumulated late pickup charges
                        </small>
                    </td>

                    <td class="text-center">
                        1
                    </td>

                    <td class="text-right">
                        {{ number_format($latePickupFee, 2) }}
                    </td>

                    <td class="text-right">
                        {{ number_format($latePickupFee, 2) }}
                    </td>
                </tr>
            @endif

            <!-- Other Charges -->
            @if(isset($otherCharges) && $otherCharges > 0)
                <tr>
                    <td>
                        <strong>
                            Other Charges
                        </strong>

                        <br>

                        <small style="color: #666666;">
                            Additional fee charges
                        </small>
                    </td>

                    <td class="text-center">
                        1
                    </td>

                    <td class="text-right">
                        {{ number_format($otherCharges, 2) }}
                    </td>

                    <td class="text-right">
                        {{ number_format($otherCharges, 2) }}
                    </td>
                </tr>
            @endif

        </tbody>
    </table>

    <!-- Payment Summary -->
    <table class="summary-table">

        <tr>
            <td>
                Subtotal
            </td>

            <td class="text-right">
                RM {{ number_format($totalAmount, 2) }}
            </td>
        </tr>

        <tr class="summary-total">
            <td>
                Total Paid
            </td>

            <td class="text-right">
                RM {{ number_format($amountPaid, 2) }}
            </td>
        </tr>

        <tr>
            <td>
                Balance Due
            </td>

            <td class="text-right">
                RM {{ number_format($balance, 2) }}
            </td>
        </tr>

    </table>

    <!-- Receipt Notes -->
    <div class="notes-section">

        <p>
            <strong>Notes:</strong>
            <br>
            Thank you for choosing Tinta Tots Clubhouse.
            This official receipt serves as proof of payment.
        </p>

        <p>
            <strong>Payment Information:</strong>
            <br>
            Payment Method: {{ $paymentMethod }}
            <br>
            Transaction ID: {{ $transactionId }}
        </p>

    </div>

</body>
</html>
