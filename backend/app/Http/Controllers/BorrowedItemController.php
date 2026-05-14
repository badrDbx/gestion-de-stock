<?php

namespace App\Http\Controllers;

use App\Models\BorrowedItem;
use Illuminate\Http\Request;

class BorrowedItemController extends Controller
{
    private function formatBorrowedItem($item)
    {
        return [
            'id' => (string) $item->id,
            'requestId' => (string) $item->material_request_id,
            'userId' => (string) $item->user_id,
            'userName' => $item->user ? $item->user->name : '',
            'materialId' => (string) $item->material_id,
            'materialName' => $item->material ? $item->material->name : '',
            'quantity' => $item->quantity,
            'borrowDate' => $item->borrow_date,
            'expectedReturnDate' => $item->expected_return_date,
            'status' => $item->status,
            'createdAt' => $item->created_at,
            'updatedAt' => $item->updated_at,
        ];
    }

    private function mapToDbKeys($data)
    {
        $map = [
            'requestId' => 'material_request_id',
            'userId' => 'user_id',
            'materialId' => 'material_id',
            'borrowDate' => 'borrow_date',
            'expectedReturnDate' => 'expected_return_date',
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
        return BorrowedItem::with(['user', 'material', 'materialRequest'])->get()->map(function ($item) {
            return $this->formatBorrowedItem($item);
        });
    }

    public function store(Request $request)
    {
        $data = $this->mapToDbKeys($request->all());
        $borrowedItem = BorrowedItem::create($data);
        return $this->formatBorrowedItem($borrowedItem->load(['user', 'material', 'materialRequest']));
    }

    public function show(BorrowedItem $borrowedItem)
    {
        return $this->formatBorrowedItem($borrowedItem->load(['user', 'material', 'materialRequest']));
    }

    public function update(Request $request, BorrowedItem $borrowedItem)
    {
        $data = $this->mapToDbKeys($request->all());
        $borrowedItem->update($data);
        return $this->formatBorrowedItem($borrowedItem->load(['user', 'material', 'materialRequest']));
    }

    public function destroy(BorrowedItem $borrowedItem)
    {
        $borrowedItem->delete();
        return response()->noContent();
    }
}
