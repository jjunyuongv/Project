package com.pj.springboot.arch.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pj.springboot.arch.entity.ArchfilesEntity;

@Repository
public interface ArchfilesRepository extends JpaRepository<ArchfilesEntity, Integer> {

	List<ArchfilesEntity> findByArchId(Integer archId);

	void deleteByArchId(Integer archId);

	int countByArchId(Integer archId);

}
