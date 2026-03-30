<?php

return [
    'facebook' => [
        'secret' => env('WEBHOOK_FACEBOOK_SECRET', 'facebook-secret'),
    ],
    'whatsapp' => [
        'secret' => env('WEBHOOK_WHATSAPP_SECRET', 'whatsapp-secret'),
    ],
    'zapier' => [
        'secret' => env('WEBHOOK_ZAPIER_SECRET', 'zapier-secret'),
    ],
];