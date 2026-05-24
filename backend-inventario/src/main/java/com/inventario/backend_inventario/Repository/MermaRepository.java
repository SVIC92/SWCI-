package com.inventario.backend_inventario.Repository;

import com.inventario.backend_inventario.Model.Merma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MermaRepository extends JpaRepository<Merma, Long> {
}