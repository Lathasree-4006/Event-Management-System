package com.example.event_management_system.repository;

import com.example.event_management_system.entity.OrganizerReward;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrganizerRewardRepository extends JpaRepository<OrganizerReward, Long> {

    List<OrganizerReward> findByOrganizerName(String organizerName);
    boolean existsByOrganizerNameAndYear(String organizerName, int year);
}