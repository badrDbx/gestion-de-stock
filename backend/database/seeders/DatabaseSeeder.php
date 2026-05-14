<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Users
        $users = [
            [
                'name' => 'Administrateur Général',
                'email' => 'admin@gmail.com',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'department' => 'Centre Informatique',
                'phone' => '0612345678',
            ],
            [
                'name' => 'Badr Dbx',
                'email' => 'badrdbx@gmail.com',
                'password' => bcrypt('password'),
                'role' => 'user',
                'department' => 'Service Sécurité Informatique',
                'phone' => '0638389560',
            ],
            [
                'name' => 'Taha Bouzidi',
                'email' => 'taha.bouzidi@gmail.com',
                'password' => bcrypt('password'),
                'role' => 'user',
                'department' => 'Service de Chirurgie',
                'phone' => '0634567890',
            ],
            [
                'name' => 'Bakhtaoui Zakia',
                'email' => 'bakhtaoui.zakia@gmail.com',
                'password' => bcrypt('password'),
                'role' => 'user',
                'department' => 'Service Informatique',
                'phone' => '0667890123',
            ],
            [
                'name' => 'Mohamed Idrissi',
                'email' => 'mohamed.idrissi@gmail.com',
                'password' => bcrypt('password'),
                'role' => 'user',
                'department' => 'Médecine Interne',
                'phone' => '0645678901',
            ],
            [
                'name' => 'Fatima Zahra',
                'email' => 'fatima.zahra@gmail.com',
                'password' => bcrypt('password'),
                'role' => 'user',
                'department' => 'Pédiatrie',
                'phone' => '0656789012',
            ],
        ];

        foreach ($users as $userData) {
            \App\Models\User::create($userData);
        }

        // Materials
        $materials = [
            [
                'name' => 'Papier A4',
                'description' => 'Papier d\'impression A4 standard',
                'type' => 'consumable',
                'category' => 'Bureautique',
                'quantity' => 0,
                'min_quantity' => 10,
                'unit' => 'Rame',
                'location' => 'Entrepôt Principal - Étagère A1',
                'image' => '/inventory/a4_paper.png',
            ],
            [
                'name' => 'Souris Optique',
                'description' => 'Souris USB filaire',
                'type' => 'consumable',
                'category' => 'Informatique',
                'quantity' => 3,
                'min_quantity' => 5,
                'unit' => 'Pièce',
                'location' => 'Entrepôt Principal - Étagère B2',
                'image' => '/inventory/mouse.png',
            ],
            [
                'name' => 'Clavier',
                'description' => 'Clavier USB AZERTY/QWERTY',
                'type' => 'consumable',
                'category' => 'Informatique',
                'quantity' => 15,
                'min_quantity' => 5,
                'unit' => 'Pièce',
                'location' => 'Entrepôt Principal - Étagère B2',
            ],
            [
                'name' => 'Encre Imprimante HP',
                'description' => 'Cartouche d\'encre HP 305 noire',
                'type' => 'consumable',
                'category' => 'Impression',
                'quantity' => 8,
                'min_quantity' => 5,
                'unit' => 'Pièce',
                'location' => 'Entrepôt Principal - Étagère C3',
            ],
            [
                'name' => 'Stylos à bille',
                'description' => 'Stylos à bille bleus',
                'type' => 'consumable',
                'category' => 'Bureautique',
                'quantity' => 100,
                'min_quantity' => 20,
                'unit' => 'Boîte',
                'location' => 'Entrepôt Principal - Étagère D4',
            ],
            [
                'name' => 'Toner HP 26A',
                'description' => 'Cartouche de toner pour HP LaserJet',
                'type' => 'returnable',
                'category' => 'Impression',
                'quantity' => 1,
                'min_quantity' => 2,
                'unit' => 'Pièce',
                'location' => 'Entrepôt Principal - Étagère C3',
            ],
            [
                'name' => 'Projecteur',
                'description' => 'Projecteur Epson pour présentations',
                'type' => 'returnable',
                'category' => 'Audiovisuel',
                'quantity' => 3,
                'min_quantity' => 1,
                'unit' => 'Appareil',
                'location' => 'Entrepôt Principal - Étagère E5',
            ],
            [
                'name' => 'Ordinateur Portable Dell',
                'description' => 'Dell Latitude pour usage temporaire',
                'type' => 'returnable',
                'category' => 'Informatique',
                'quantity' => 4,
                'min_quantity' => 1,
                'unit' => 'Appareil',
                'location' => 'Entrepôt Principal - Étagère F6',
                'image' => '/inventory/laptop.png',
            ],
            [
                'name' => 'Tablette tactile',
                'description' => 'Tablette Samsung pour usage temporaire',
                'type' => 'returnable',
                'category' => 'Informatique',
                'quantity' => 6,
                'min_quantity' => 2,
                'unit' => 'Appareil',
                'location' => 'Entrepôt Principal - Étagère F6',
            ],
            [
                'name' => 'Câble HDMI',
                'description' => 'Câble HDMI de 3 mètres',
                'type' => 'returnable',
                'category' => 'Réseau & Câblage',
                'quantity' => 10,
                'min_quantity' => 3,
                'unit' => 'Pièce',
                'location' => 'Entrepôt Principal - Étagère G7',
            ],
        ];

        foreach ($materials as $materialData) {
            \App\Models\Material::create($materialData);
        }

        // Requests
        $requests = [
            [
                'user_id' => 2, // Badr Dbx
                'material_id' => 1, // Papier A4
                'quantity' => 5,
                'status' => 'delivered',
                'type' => 'consumable',
                'request_date' => '2024-03-15',
                'delivery_date' => '2024-03-16',
                'notes' => 'Pour usage quotidien au service des urgences',
            ],
            [
                'user_id' => 2, // Badr Dbx
                'material_id' => 6, // Toner HP 26A
                'quantity' => 1,
                'status' => 'returned',
                'type' => 'returnable',
                'request_date' => '2024-03-10',
                'delivery_date' => '2024-03-11',
                'expected_return_date' => '2024-03-18',
                'return_date' => '2024-03-18',
                'notes' => 'Pour l\'imprimante principale',
            ],
            [
                'user_id' => 3, // Taha Bouzidi
                'material_id' => 7, // Projecteur
                'quantity' => 1,
                'status' => 'borrowed',
                'type' => 'returnable',
                'request_date' => '2024-03-20',
                'delivery_date' => '2024-03-21',
                'expected_return_date' => '2024-03-28',
                'notes' => 'Pour une présentation au service de chirurgie',
            ],
            [
                'user_id' => 3, // Taha Bouzidi
                'material_id' => 2, // Souris Optique
                'quantity' => 2,
                'status' => 'pending',
                'type' => 'consumable',
                'request_date' => '2024-03-22',
                'notes' => 'Pour de nouveaux équipements dans le service',
            ],
            [
                'user_id' => 2, // Badr Dbx
                'material_id' => 8, // Ordinateur Portable Dell
                'quantity' => 1,
                'status' => 'approved',
                'type' => 'returnable',
                'request_date' => '2024-03-21',
                'delivery_date' => '2024-03-22',
                'expected_return_date' => '2024-03-29',
                'notes' => 'Pour le télétravail',
            ],
        ];

        foreach ($requests as $requestData) {
            \App\Models\MaterialRequest::create($requestData);
        }

        // Borrowed Items
        $borrowedItems = [
            [
                'material_request_id' => 3,
                'user_id' => 3,
                'material_id' => 7,
                'quantity' => 1,
                'borrow_date' => '2024-03-21',
                'expected_return_date' => '2024-03-28',
                'status' => 'borrowed',
            ],
            [
                'material_request_id' => 5,
                'user_id' => 2,
                'material_id' => 8,
                'quantity' => 1,
                'borrow_date' => '2024-03-22',
                'expected_return_date' => '2024-03-29',
                'status' => 'borrowed',
            ],
        ];

        foreach ($borrowedItems as $borrowData) {
            \App\Models\BorrowedItem::create($borrowData);
        }
    }
}
