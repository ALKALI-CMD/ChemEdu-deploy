package microservices.admin.tables

import cats.effect.IO
import microservices.admin.objects.{AcademicClass, Department, Major, SemesterTerm}

import java.sql.{Connection, PreparedStatement, ResultSet}

object OrganizationTable:

  val schemaStatements: List[String] = List(
    """
      |create table if not exists edu_departments (
      |  id varchar(64) primary key,
      |  name varchar(120) not null
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_majors (
      |  id varchar(64) primary key,
      |  department_id varchar(64) not null references edu_departments(id) on delete cascade,
      |  name varchar(120) not null
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_academic_classes (
      |  id varchar(64) primary key,
      |  major_id varchar(64) not null references edu_majors(id) on delete cascade,
      |  grade varchar(80) not null,
      |  name varchar(120) not null,
      |  capacity integer not null default 50
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_semesters (
      |  id varchar(64) primary key,
      |  label varchar(120) not null,
      |  start_at varchar(80) not null,
      |  end_at varchar(80) not null,
      |  archived boolean not null default false
      |);
      |""".stripMargin
  )

  val listDepartmentsSql: String =
    "select id, name from edu_departments order by id asc"

  val listMajorsSql: String =
    "select id, department_id, name from edu_majors order by id asc"

  val listAcademicClassesSql: String =
    "select id, major_id, grade, name, capacity from edu_academic_classes order by id asc"

  val listAcademicClassMembershipsSql: String =
    "select id, academic_class_id from edu_users where academic_class_id is not null and academic_class_id <> ''"

  val listSemestersSql: String =
    "select id, label, start_at, end_at, archived from edu_semesters order by start_at asc, id asc"

  val findDepartmentByIdSql: String =
    "select id, name from edu_departments where id = ?"

  val findMajorByIdSql: String =
    "select id, department_id, name from edu_majors where id = ?"

  val findAcademicClassByIdSql: String =
    """
      |select id, major_id, grade, name, capacity
      |from edu_academic_classes
      |where id = ?
      |""".stripMargin

  val listStudentIdsByAcademicClassSql: String =
    "select id from edu_users where academic_class_id = ? order by id asc"

  val findSemesterByIdSql: String =
    """
      |select id, label, start_at, end_at, archived
      |from edu_semesters
      |where id = ?
      |""".stripMargin

  val upsertDepartmentSql: String =
    """
      |insert into edu_departments (id, name)
      |values (?, ?)
      |on conflict (id) do update set
      |name = excluded.name
      |""".stripMargin

  val upsertMajorSql: String =
    """
      |insert into edu_majors (id, department_id, name)
      |values (?, ?, ?)
      |on conflict (id) do update set
      |department_id = excluded.department_id,
      |name = excluded.name
      |""".stripMargin

  val upsertAcademicClassSql: String =
    """
      |insert into edu_academic_classes (id, major_id, grade, name, capacity)
      |values (?, ?, ?, ?, ?)
      |on conflict (id) do update set
      |major_id = excluded.major_id,
      |grade = excluded.grade,
      |name = excluded.name,
      |capacity = excluded.capacity
      |""".stripMargin

  val upsertSemesterSql: String =
    """
      |insert into edu_semesters (id, label, start_at, end_at, archived)
      |values (?, ?, ?, ?, ?)
      |on conflict (id) do update set
      |label = excluded.label,
      |start_at = excluded.start_at,
      |end_at = excluded.end_at,
      |archived = excluded.archived
      |""".stripMargin

  val deleteDepartmentSql: String =
    "delete from edu_departments where id = ?"

  val deleteMajorSql: String =
    "delete from edu_majors where id = ?"

  val deleteAcademicClassSql: String =
    "delete from edu_academic_classes where id = ?"

  val deleteSemesterSql: String =
    "delete from edu_semesters where id = ?"

  val assignStudentToAcademicClassSql: String =
    """
      |update edu_users
      |set department_id = ?, department_name = ?, major_id = ?, major_name = ?,
      |academic_class_id = ?, academic_class_name = ?
      |where id = ? and role = 'student'
      |""".stripMargin

  val clearStudentAcademicClassSql: String =
    """
      |update edu_users
      |set academic_class_id = null, academic_class_name = null
      |where id = ? and role = 'student'
      |""".stripMargin

  val updateCourseAcademicClassesSql: String =
    "update edu_courses set academic_class_ids = ?, updated_at = now() where id = ?"

  val findEnrollmentStatusSql: String =
    "select status from edu_enrollments where user_id = ? and course_id = ?"

  val updateEnrollmentStatusSql: String =
    "update edu_enrollments set status = ?, enrolled_at = ? where user_id = ? and course_id = ?"

  val findWaitlistPositionSql: String =
    "select position from edu_course_waitlist where user_id = ? and course_id = ?"

  val promoteWaitlistEnrollmentSql: String =
    """
      |insert into edu_enrollments (user_id, course_id, enrolled_at, status)
      |values (?, ?, ?, 'enrolled')
      |on conflict (user_id, course_id) do update set
      |enrolled_at = excluded.enrolled_at,
      |status = 'enrolled'
      |""".stripMargin

  val deleteWaitlistEntrySql: String =
    "delete from edu_course_waitlist where user_id = ? and course_id = ?"

  val decrementWaitlistPositionsSql: String =
    "update edu_course_waitlist set position = position - 1 where course_id = ? and position > ?"

  val archiveSemesterSql: String =
    "update edu_semesters set archived = true where id = ?"

  val archiveSemesterCoursesSql: String =
    "update edu_courses set status = ?, updated_at = now() where semester_label = ? and status <> ?"

  val countCoursesLinkedToAcademicClassSql: String =
    """
      |select count(*)
      |from edu_courses
      |where academic_class_ids = ?
      |   or academic_class_ids like ?
      |   or academic_class_ids like ?
      |   or academic_class_ids like ?
      |""".stripMargin

  val countMajorsInDepartmentSql: String =
    "select count(*) from edu_majors where department_id = ?"

  val countAcademicClassesInMajorSql: String =
    "select count(*) from edu_academic_classes where major_id = ?"

  val countCoursesInSemesterSql: String =
    "select count(*) from edu_courses where semester_label = ?"

  val countActiveEnrollmentsForCourseSql: String =
    "select count(*) from edu_enrollments where course_id = ? and status = 'enrolled'"

  def listDepartments(connection: Connection): IO[List[Department]] =
    selectList(connection, listDepartmentsSql)(resultSet =>
      Department(
        id = resultSet.getString("id"),
        name = resultSet.getString("name")
      )
    )

  def listMajors(connection: Connection): IO[List[Major]] =
    selectList(connection, listMajorsSql)(resultSet =>
      Major(
        id = resultSet.getString("id"),
        departmentId = resultSet.getString("department_id"),
        name = resultSet.getString("name")
      )
    )

  def listAcademicClasses(connection: Connection): IO[List[AcademicClass]] =
    for
      classes <- selectList(connection, listAcademicClassesSql)(resultSet =>
        AcademicClass(
          id = resultSet.getString("id"),
          majorId = resultSet.getString("major_id"),
          grade = resultSet.getString("grade"),
          name = resultSet.getString("name"),
          capacity = resultSet.getInt("capacity"),
          studentIds = Nil
        )
      )
      classMemberships <- selectList(connection, listAcademicClassMembershipsSql)(resultSet =>
        resultSet.getString("academic_class_id") -> resultSet.getString("id")
      )
      studentIdsByClass = classMemberships.groupBy(_._1).view.mapValues(_.map(_._2)).toMap
    yield classes.map(academicClass => academicClass.copy(studentIds = studentIdsByClass.getOrElse(academicClass.id, Nil)))

  def listSemesters(connection: Connection): IO[List[SemesterTerm]] =
    selectList(connection, listSemestersSql)(resultSet =>
      SemesterTerm(
        id = resultSet.getString("id"),
        label = resultSet.getString("label"),
        startAt = resultSet.getString("start_at"),
        endAt = resultSet.getString("end_at"),
        archived = resultSet.getBoolean("archived")
      )
    )

  def findDepartmentById(connection: Connection, departmentId: String): IO[Option[Department]] =
    selectOne(connection.prepareStatement(findDepartmentByIdSql)) { statement =>
      statement.setObject(1, departmentId)
    }(resultSet => Department(resultSet.getString("id"), resultSet.getString("name")))

  def findMajorById(connection: Connection, majorId: String): IO[Option[Major]] =
    selectOne(connection.prepareStatement(findMajorByIdSql)) { statement =>
      statement.setObject(1, majorId)
    }(resultSet => Major(resultSet.getString("id"), resultSet.getString("department_id"), resultSet.getString("name")))

  def findAcademicClassById(connection: Connection, academicClassId: String): IO[Option[AcademicClass]] =
    selectOne(connection.prepareStatement(findAcademicClassByIdSql)) { statement =>
      statement.setObject(1, academicClassId)
    }(readAcademicClassWithoutStudents).flatMap {
      case Some(academicClass) =>
        selectPreparedList(connection.prepareStatement(listStudentIdsByAcademicClassSql)) { statement =>
          statement.setObject(1, academicClass.id)
        }(_.getString("id")).map(studentIds => Some(academicClass.copy(studentIds = studentIds)))
      case None => IO.pure(None)
    }

  def findSemesterById(connection: Connection, semesterId: String): IO[Option[SemesterTerm]] =
    selectOne(connection.prepareStatement(findSemesterByIdSql)) { statement =>
      statement.setObject(1, semesterId)
    }(readSemester)

  def upsertDepartment(connection: Connection, departmentId: String, name: String): IO[Unit] =
    execute(connection.prepareStatement(upsertDepartmentSql)) { statement =>
      statement.setObject(1, departmentId)
      statement.setObject(2, name)
    }.void

  def upsertMajor(connection: Connection, majorId: String, departmentId: String, name: String): IO[Unit] =
    execute(connection.prepareStatement(upsertMajorSql)) { statement =>
      statement.setObject(1, majorId)
      statement.setObject(2, departmentId)
      statement.setObject(3, name)
    }.void

  def upsertAcademicClass(connection: Connection, academicClassId: String, majorId: String, grade: String, name: String, capacity: Int): IO[Unit] =
    execute(connection.prepareStatement(upsertAcademicClassSql)) { statement =>
      statement.setObject(1, academicClassId)
      statement.setObject(2, majorId)
      statement.setObject(3, grade)
      statement.setObject(4, name)
      statement.setObject(5, capacity)
    }.void

  def upsertSemester(connection: Connection, semesterId: String, label: String, startAt: String, endAt: String, archived: Boolean): IO[Unit] =
    execute(connection.prepareStatement(upsertSemesterSql)) { statement =>
      statement.setObject(1, semesterId)
      statement.setObject(2, label)
      statement.setObject(3, startAt)
      statement.setObject(4, endAt)
      statement.setBoolean(5, archived)
    }.void

  def deleteDepartment(connection: Connection, departmentId: String): IO[Int] =
    execute(connection.prepareStatement(deleteDepartmentSql))(_.setObject(1, departmentId))

  def deleteMajor(connection: Connection, majorId: String): IO[Int] =
    execute(connection.prepareStatement(deleteMajorSql))(_.setObject(1, majorId))

  def deleteAcademicClass(connection: Connection, academicClassId: String): IO[Int] =
    execute(connection.prepareStatement(deleteAcademicClassSql))(_.setObject(1, academicClassId))

  def deleteSemester(connection: Connection, semesterId: String): IO[Int] =
    execute(connection.prepareStatement(deleteSemesterSql))(_.setObject(1, semesterId))

  def assignStudentToAcademicClass(connection: Connection, department: Department, major: Major, academicClass: AcademicClass, studentId: String): IO[Int] =
    execute(connection.prepareStatement(assignStudentToAcademicClassSql)) { statement =>
      statement.setObject(1, department.id)
      statement.setObject(2, department.name)
      statement.setObject(3, major.id)
      statement.setObject(4, major.name)
      statement.setObject(5, academicClass.id)
      statement.setObject(6, academicClass.name)
      statement.setObject(7, studentId)
    }

  def clearStudentAcademicClass(connection: Connection, studentId: String): IO[Int] =
    execute(connection.prepareStatement(clearStudentAcademicClassSql))(_.setObject(1, studentId))

  def updateCourseAcademicClasses(connection: Connection, courseId: String, academicClassIds: List[String]): IO[Int] =
    execute(connection.prepareStatement(updateCourseAcademicClassesSql)) { statement =>
      statement.setObject(1, academicClassIds.mkString(","))
      statement.setObject(2, courseId)
    }

  def findEnrollmentStatus(connection: Connection, userId: String, courseId: String): IO[Option[String]] =
    selectOne(connection.prepareStatement(findEnrollmentStatusSql)) { statement =>
      statement.setObject(1, userId)
      statement.setObject(2, courseId)
    }(resultSet => Option(resultSet.getString("status")).getOrElse("enrolled"))

  def updateEnrollmentStatus(connection: Connection, userId: String, courseId: String, status: String, enrolledAt: String): IO[Int] =
    execute(connection.prepareStatement(updateEnrollmentStatusSql)) { statement =>
      statement.setObject(1, status)
      statement.setObject(2, enrolledAt)
      statement.setObject(3, userId)
      statement.setObject(4, courseId)
    }

  def findWaitlistPosition(connection: Connection, userId: String, courseId: String): IO[Option[Int]] =
    selectOne(connection.prepareStatement(findWaitlistPositionSql)) { statement =>
      statement.setObject(1, userId)
      statement.setObject(2, courseId)
    }(_.getInt("position"))

  def promoteWaitlistEnrollment(connection: Connection, userId: String, courseId: String, enrolledAt: String): IO[Int] =
    execute(connection.prepareStatement(promoteWaitlistEnrollmentSql)) { statement =>
      statement.setObject(1, userId)
      statement.setObject(2, courseId)
      statement.setObject(3, enrolledAt)
    }

  def deleteWaitlistEntry(connection: Connection, userId: String, courseId: String): IO[Int] =
    execute(connection.prepareStatement(deleteWaitlistEntrySql)) { statement =>
      statement.setObject(1, userId)
      statement.setObject(2, courseId)
    }

  def decrementWaitlistPositions(connection: Connection, courseId: String, position: Int): IO[Int] =
    execute(connection.prepareStatement(decrementWaitlistPositionsSql)) { statement =>
      statement.setObject(1, courseId)
      statement.setObject(2, position)
    }

  def archiveSemester(connection: Connection, semesterId: String): IO[Int] =
    execute(connection.prepareStatement(archiveSemesterSql))(_.setObject(1, semesterId))

  def archiveSemesterCourses(connection: Connection, semesterLabel: String, archivedStatus: String): IO[Int] =
    execute(connection.prepareStatement(archiveSemesterCoursesSql)) { statement =>
      statement.setObject(1, archivedStatus)
      statement.setObject(2, semesterLabel)
      statement.setObject(3, archivedStatus)
    }

  def countCoursesLinkedToAcademicClass(connection: Connection, academicClassId: String): IO[Int] =
    scalar(connection.prepareStatement(countCoursesLinkedToAcademicClassSql)) { statement =>
      statement.setObject(1, academicClassId)
      statement.setObject(2, s"$academicClassId,%")
      statement.setObject(3, s"%,$academicClassId")
      statement.setObject(4, s"%,$academicClassId,%")
    }

  def countMajorsInDepartment(connection: Connection, departmentId: String): IO[Int] =
    scalar(connection.prepareStatement(countMajorsInDepartmentSql))(_.setObject(1, departmentId))

  def countAcademicClassesInMajor(connection: Connection, majorId: String): IO[Int] =
    scalar(connection.prepareStatement(countAcademicClassesInMajorSql))(_.setObject(1, majorId))

  def countCoursesInSemester(connection: Connection, semesterLabel: String): IO[Int] =
    scalar(connection.prepareStatement(countCoursesInSemesterSql))(_.setObject(1, semesterLabel))

  def countActiveEnrollmentsForCourse(connection: Connection, courseId: String): IO[Int] =
    scalar(connection.prepareStatement(countActiveEnrollmentsForCourseSql))(_.setObject(1, courseId))

  private def readAcademicClassWithoutStudents(resultSet: ResultSet): AcademicClass =
    AcademicClass(
      id = resultSet.getString("id"),
      majorId = resultSet.getString("major_id"),
      grade = resultSet.getString("grade"),
      name = resultSet.getString("name"),
      capacity = resultSet.getInt("capacity"),
      studentIds = Nil
    )

  private def readSemester(resultSet: ResultSet): SemesterTerm =
    SemesterTerm(
      id = resultSet.getString("id"),
      label = resultSet.getString("label"),
      startAt = resultSet.getString("start_at"),
      endAt = resultSet.getString("end_at"),
      archived = resultSet.getBoolean("archived")
    )

  private def selectList[A](connection: Connection, sql: String)(read: ResultSet => A): IO[List[A]] =
    IO.blocking {
      val statement = connection.createStatement()
      try
        val resultSet = statement.executeQuery(sql)
        try
          val buffer = scala.collection.mutable.ListBuffer.empty[A]
          while resultSet.next() do buffer += read(resultSet)
          buffer.toList
        finally resultSet.close()
      finally statement.close()
    }

  private def selectPreparedList[A](statement: PreparedStatement)(bind: PreparedStatement => Unit)(read: ResultSet => A): IO[List[A]] =
    IO.blocking {
      try
        bind(statement)
        val resultSet = statement.executeQuery()
        try
          val buffer = scala.collection.mutable.ListBuffer.empty[A]
          while resultSet.next() do buffer += read(resultSet)
          buffer.toList
        finally resultSet.close()
      finally statement.close()
    }

  private def selectOne[A](statement: PreparedStatement)(bind: PreparedStatement => Unit)(read: ResultSet => A): IO[Option[A]] =
    IO.blocking {
      try
        bind(statement)
        val resultSet = statement.executeQuery()
        try if resultSet.next() then Some(read(resultSet)) else None
        finally resultSet.close()
      finally statement.close()
    }

  private def scalar(statement: PreparedStatement)(bind: PreparedStatement => Unit): IO[Int] =
    selectOne(statement)(bind)(_.getInt(1)).map(_.getOrElse(0))

  private def execute(statement: PreparedStatement)(bind: PreparedStatement => Unit): IO[Int] =
    IO.blocking {
      try
        bind(statement)
        statement.executeUpdate()
      finally statement.close()
    }
