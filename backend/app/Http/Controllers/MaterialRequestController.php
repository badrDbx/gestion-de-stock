<?php

namespace App\Http\Controllers;

use App\Models\MaterialRequest;
use Illuminate\Http\Request;

class MaterialRequestController extends Controller
{
    private function formatMaterialRequest($request)
    {
        return [
            'id' => (string) $request->id,
            'userId' => (string) $request->user_id,
            'userName' => $request->user ? $request->user->name : '',
            'materialId' => (string) $request->material_id,
            'materialName' => $request->material ? $request->material->name : '',
            'quantity' => $request->quantity,
            'status' => $request->status,
            'type' => $request->type,
            'requestDate' => $request->request_date,
            'deliveryDate' => $request->delivery_date,
            'expectedReturnDate' => $request->expected_return_date,
            'actualReturnDate' => $request->return_date,
            'returnDate' => $request->return_date,
            'notes' => $request->notes,
            'createdAt' => $request->created_at ? $request->created_at->toIso8601String() : null,
            'updatedAt' => $request->updated_at ? $request->updated_at->toIso8601String() : null,
        ];
    }

    private function mapToDbKeys($data)
    {
        $map = [
            'userId' => 'user_id',
            'materialId' => 'material_id',
            'requestDate' => 'request_date',
            'deliveryDate' => 'delivery_date',
            'expectedReturnDate' => 'expected_return_date',
            'actualReturnDate' => 'return_date',
            'returnDate' => 'return_date',
        ];

        foreach ($map as $camel => $snake) {
            if (isset($data[$camel])) {
                $data[$snake] = $data[$camel];
                unset($data[$camel]);
            }
        }
        return $data;
    }

    public function index()
    {
        return MaterialRequest::with(['user', 'material'])->get()->map(function ($req) {
            return $this->formatMaterialRequest($req);
        });
    }

    public function store(Request $request)
    {
        $data = $this->mapToDbKeys($request->all());
        $materialRequest = MaterialRequest::create($data);
        
        // If created with delivered/borrowed status, adjust stock
        if (in_array($materialRequest->status, ['delivered', 'borrowed'])) {
            $material = $materialRequest->material;
            if ($material) {
                $material->decrement('quantity', $materialRequest->quantity);
            }
        }

        return $this->formatMaterialRequest($materialRequest->load(['user', 'material']));
    }

    public function show(MaterialRequest $materialRequest)
    {
        return $this->formatMaterialRequest($materialRequest->load(['user', 'material']));
    }

    public function update(Request $request, MaterialRequest $materialRequest)
    {
        $oldStatus = $materialRequest->status;
        $data = $this->mapToDbKeys($request->all());
        $materialRequest->update($data);
        $newStatus = $materialRequest->status;

        // Stock Adjustment Logic
        if ($oldStatus !== $newStatus) {
            $material = $materialRequest->material;
            if ($material) {
                // Decrease stock when items go out (delivered or borrowed)
                // Only decrease if it wasn't already out
                $isNowOut = in_array($newStatus, ['delivered', 'borrowed']);
                $wasAlreadyOut = in_array($oldStatus, ['delivered', 'borrowed']);

                if ($isNowOut && !$wasAlreadyOut) {
                    $material->decrement('quantity', $materialRequest->quantity);
                }
                
                // Increase stock when items come back (returned) or if status is reverted from "Out"
                $isNowIn = $newStatus === 'returned' || (!in_array($newStatus, ['delivered', 'borrowed']) && $wasAlreadyOut);
                
                if ($isNowIn && $wasAlreadyOut) {
                    $material->increment('quantity', $materialRequest->quantity);
                }
            }
        }

        // Sync with BorrowedItem if applicable
        if ($materialRequest->type === 'returnable') {
            if ($materialRequest->status === 'borrowed') {
                $borrowedItem = \App\Models\BorrowedItem::where('material_request_id', $materialRequest->id)->first();
                if (!$borrowedItem) {
                    \App\Models\BorrowedItem::create([
                        'material_request_id' => $materialRequest->id,
                        'user_id' => $materialRequest->user_id,
                        'material_id' => $materialRequest->material_id,
                        'quantity' => $materialRequest->quantity,
                        'borrow_date' => $materialRequest->delivery_date ?? now(),
                        'expected_return_date' => $materialRequest->expected_return_date ?? now()->addDays(7),
                        'status' => 'borrowed',
                    ]);
                } else {
                    $borrowedItem->update(['status' => 'borrowed']);
                }
            } elseif ($materialRequest->status === 'returned') {
                $borrowedItem = \App\Models\BorrowedItem::where('material_request_id', $materialRequest->id)->first();
                if ($borrowedItem) {
                    $borrowedItem->update(['status' => 'returned']);
                }
            }
        }

        return $this->formatMaterialRequest($materialRequest->load(['user', 'material']));
    }

    public function destroy(MaterialRequest $materialRequest)
    {
        // If request was active (delivered or borrowed), return stock
        if (in_array($materialRequest->status, ['delivered', 'borrowed'])) {
            $material = $materialRequest->material;
            if ($material) {
                $material->increment('quantity', $materialRequest->quantity);
            }
        }
        
        $materialRequest->delete();
        return response()->noContent();
    }
}
