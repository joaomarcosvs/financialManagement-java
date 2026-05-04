package com.financial.management.domain.repository;

import com.financial.management.domain.entity.Tag;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<Tag, UUID> {
}