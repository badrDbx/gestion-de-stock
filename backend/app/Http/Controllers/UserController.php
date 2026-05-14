<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    private function formatUser($user)
    {
        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'department' => $user->department,
            'phone' => $user->phone,
            'createdAt' => $user->created_at,
            'updatedAt' => $user->updated_at,
        ];
    }

    public function index()
    {
        return User::all()->map(function ($user) {
            return $this->formatUser($user);
        });
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'nullable|string',
            'department' => 'nullable|string',
            'phone' => 'nullable|string',
        ]);

        // Only the system can have an admin. All new users are forced to 'user' role.
        $validated['role'] = 'user';
        
        $user = User::create($validated);
        return $this->formatUser($user);
    }

    public function show(User $user)
    {
        return $this->formatUser($user);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'role' => 'required|string',
            'department' => 'nullable|string',
            'phone' => 'nullable|string',
        ]);

        $updateData = $validated;
        
        // Prevent changing role of Super Admin (ID: 1)
        if ($user->id === 1 && isset($updateData['role']) && $updateData['role'] !== 'admin') {
            return response()->json(['message' => 'Le rôle du super administrateur ne peut pas être modifié.'], 403);
        }

        // Prevent promoting any other user to admin
        if (isset($updateData['role']) && $updateData['role'] === 'admin' && $user->id !== 1) {
            return response()->json(['message' => 'Impossible de promouvoir un utilisateur au rang d\'administrateur.'], 403);
        }
        
        // Remove password from array if it's empty so we don't overwrite it with empty
        if (empty($updateData['password'])) {
            unset($updateData['password']);
        }

        $user->update($updateData);
        return $this->formatUser($user);
    }

    public function destroy(User $user)
    {
        if ($user->id === 1) {
            return response()->json(['message' => 'Le super administrateur ne peut pas être supprimé.'], 403);
        }
        
        $user->delete();
        return response()->noContent();
    }
}
