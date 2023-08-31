---
layout: course
title: GSAPP CDP 2023-4 Colloquium II
---

{% for student in collections.students %}
  <div class="project-card">
    <a class="fade" href="{{ student.url }}">
      <div class="stack">
        <div class="project-card-thumb">
          {% if student.data.image %}
            <img src="{{ student.url }}/{{ student.data.image }}" />
          {% endif %}
        </div>
        <div>
          <h2>{{ student.data.student }}</h2>
        </div>
      </div>
    </a>
  </div>
{% endfor %}
