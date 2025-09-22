package com.pj.springboot.arch.repository;

import com.pj.springboot.arch.entity.ArchiveEntity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArchiveRepository extends JpaRepository<ArchiveEntity, Integer> {

	Long countByArchTitleLike(String string);


	Long countByArchCtntLike(String string);


	Page<ArchiveEntity> findByArchTitleLike(String string, Pageable pageable);


	Page<ArchiveEntity> findByArchCtntLike(String string, Pageable pageable);


}
