package com.inventario.backend_inventario.Service;

import com.inventario.backend_inventario.Dto.MermaRequestDto;
import com.inventario.backend_inventario.Model.Merma;

public interface MermaService {
    Merma registrarMerma(MermaRequestDto request);
}