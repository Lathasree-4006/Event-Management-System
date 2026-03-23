package com.example.event_management_system.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "organizer_rewards")
public class OrganizerReward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organizer_name")
    private String organizerName;

    @Column(name = "badge_type")
    private String badgeType;

    @Column(name = "rank_position")
    private int rankPosition;

    private int year;

    // GETTERS

    public Long getId() {
        return id;
    }

    public String getOrganizerName() {
        return organizerName;
    }

    public String getBadgeType() {
        return badgeType;
    }

    public int getRankPosition() {
        return rankPosition;
    }

    public int getYear() {
        return year;
    }

    // SETTERS

    public void setId(Long id) {
        this.id = id;
    }

    public void setOrganizerName(String organizerName) {
        this.organizerName = organizerName;
    }

    public void setBadgeType(String badgeType) {
        this.badgeType = badgeType;
    }

    public void setRankPosition(int rankPosition) {
        this.rankPosition = rankPosition;
    }

    public void setYear(int year) {
        this.year = year;
    }
}
