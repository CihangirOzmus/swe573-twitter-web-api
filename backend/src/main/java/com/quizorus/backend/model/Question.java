package com.quizorus.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import java.util.List;

@Entity
@Table(name = "questions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Question extends UserDatabaseDateAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String text;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL)
    private List<Choice> choiceList;

    @JsonIgnore
    @ManyToOne
    private Content content;

    @JsonIgnore
    @OneToOne(mappedBy = "question")
    private Answer answer;

//    @OneToMany
//    @JoinTable(name = "answers",
//            joinColumns = @JoinColumn(name = "choice_id"),
//            inverseJoinColumns = @JoinColumn(name = "user_id"))
//    @MapKeyJoinColumn(name = "question_id")
//    private Map<Question, User> answers = new HashMap<>();

}
