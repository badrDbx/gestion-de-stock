<?php

namespace App\Http\Controllers;

use App\Models\Material;
use Illuminate\Http\Request;

class MaterialController extends Controller
{
    private function mapToDbKeys($data)
    {
        $map = [
            'minQuantity' => 'min_quantity',
        ];

        foreach ($map as $camel => $snake) {
            if (isset($data[$camel])) {
                $data[$snake] = $data[$camel];
                unset($data[$camel]);
            }
        }
        return $data;
    }

    private function formatMaterial($material)
    {
        return [
            'id' => (string) $material->id,
            'name' => $material->name,
            'description' => $material->description,
            'type' => $material->type,
            'category' => $material->category,
            'quantity' => $material->quantity,
            'minQuantity' => $material->min_quantity,
            'unit' => $material->unit,
            'location' => $material->location,
            'image' => $material->image,
            'createdAt' => $material->created_at,
            'updatedAt' => $material->updated_at,
        ];
    }

    public function index()
    {
        return Material::all()->map(function ($material) {
            return $this->formatMaterial($material);
        });
    }

    public function store(Request $request)
    {
        $data = $this->mapToDbKeys($request->all());
        $material = Material::create($data);
        return $this->formatMaterial($material);
    }

    public function show(Material $material)
    {
        return $this->formatMaterial($material);
    }

    public function update(Request $request, Material $material)
    {
        $data = $this->mapToDbKeys($request->all());
        $material->update($data);
        return $this->formatMaterial($material);
    }

    public function destroy(Material $material)
    {
        $material->delete();
        return response()->noContent();
    }
}
