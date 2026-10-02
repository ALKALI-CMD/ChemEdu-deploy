package microservices.admin.tables

import cats.effect.IO
import microservices.admin.objects.*
import microservices.auth.objects.{UserProfile, UserRole}
import microservices.course.catalog.objects.ResourceAsset
import microservices.course.discussion.objects.MessageThread

import java.sql.{Connection, PreparedStatement, ResultSet}

object BusinessOpsTable:

  val schemaStatements: List[String] = List(
    """
      |create table if not exists edu_messages (
      |  id varchar(64) primary key,
      |  sender_name varchar(120) not null,
      |  recipient_name varchar(120) not null,
      |  content text not null,
      |  attachment_label varchar(200),
      |  sent_at varchar(80) not null,
      |  read boolean not null default false,
      |  category varchar(64) not null default 'message',
      |  course_id varchar(64)
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_notifications (
      |  id varchar(64) primary key,
      |  user_id varchar(64) not null references edu_users(id) on delete cascade,
      |  course_id varchar(64),
      |  category varchar(64) not null,
      |  title varchar(200) not null,
      |  content text not null,
      |  read boolean not null default false,
      |  created_at varchar(80) not null,
      |  action_url varchar(240)
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_notification_settings (
      |  user_id varchar(64) not null references edu_users(id) on delete cascade,
      |  category varchar(64) not null,
      |  enabled boolean not null default true,
      |  primary key (user_id, category)
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_orders (
      |  id varchar(64) primary key,
      |  buyer varchar(120) not null,
      |  course_title varchar(200) not null,
      |  amount integer not null,
      |  status varchar(32) not null,
      |  paid_at varchar(80) not null,
      |  original_amount integer not null default 0,
      |  discount_amount integer not null default 0,
      |  payment_state varchar(32) not null default 'paid',
      |  payment_method varchar(64),
      |  coupon_code varchar(64),
      |  refund_status varchar(64),
      |  refund_amount integer not null default 0,
      |  invoice_status varchar(64),
      |  invoice_title varchar(200),
      |  promotion_id varchar(64),
      |  billing_cycle varchar(64)
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_coupons (
      |  id varchar(64) primary key,
      |  code varchar(64) not null unique,
      |  title varchar(200) not null,
      |  discount_amount integer not null,
      |  min_amount integer not null,
      |  valid_from varchar(80) not null,
      |  valid_to varchar(80) not null,
      |  active boolean not null default true
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_promotions (
      |  id varchar(64) primary key,
      |  title varchar(200) not null,
      |  description text not null,
      |  discount_percent integer not null,
      |  starts_at varchar(80) not null,
      |  ends_at varchar(80) not null,
      |  active boolean not null default true
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_invoices (
      |  id varchar(64) primary key,
      |  order_id varchar(64) not null,
      |  title varchar(200) not null,
      |  amount integer not null,
      |  status varchar(64) not null,
      |  issued_at varchar(80)
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_refunds (
      |  id varchar(64) primary key,
      |  order_id varchar(64) not null,
      |  amount integer not null,
      |  reason text not null,
      |  status varchar(64) not null,
      |  requested_at varchar(80) not null,
      |  processed_at varchar(80)
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_resource_assets (
      |  id varchar(64) primary key,
      |  course_id varchar(64) not null references edu_courses(id) on delete cascade,
      |  owner_id varchar(64) not null references edu_users(id) on delete cascade,
      |  filename varchar(240) not null,
      |  content_type varchar(120) not null,
      |  size_bytes bigint not null,
      |  storage_key varchar(320) not null,
      |  preview_url varchar(320) not null,
      |  download_url varchar(320) not null,
      |  version integer not null default 1,
      |  visibility varchar(64) not null default 'course_members',
      |  created_at varchar(80) not null,
      |  updated_at varchar(80) not null
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_teacher_tasks (
      |  id varchar(64) primary key,
      |  title varchar(200) not null,
      |  assignee varchar(120) not null,
      |  status varchar(32) not null
      |);
      |""".stripMargin,
    "alter table edu_messages add column if not exists read boolean not null default false",
    "alter table edu_messages add column if not exists category varchar(64) not null default 'message'",
    "alter table edu_messages add column if not exists course_id varchar(64)",
    "alter table edu_orders add column if not exists original_amount integer not null default 0",
    "alter table edu_orders add column if not exists discount_amount integer not null default 0",
    "alter table edu_orders add column if not exists payment_state varchar(32) not null default 'paid'",
    "alter table edu_orders add column if not exists payment_method varchar(64)",
    "alter table edu_orders add column if not exists coupon_code varchar(64)",
    "alter table edu_orders add column if not exists refund_status varchar(64)",
    "alter table edu_orders add column if not exists refund_amount integer not null default 0",
    "alter table edu_orders add column if not exists invoice_status varchar(64)",
    "alter table edu_orders add column if not exists invoice_title varchar(200)",
    "alter table edu_orders add column if not exists promotion_id varchar(64)",
    "alter table edu_orders add column if not exists billing_cycle varchar(64)",
    "update edu_orders set original_amount = amount where original_amount = 0",
    """
      |update edu_orders
      |set original_amount = 299,
      |    discount_amount = 50,
      |    payment_state = 'paid',
      |    payment_method = 'wechat',
      |    coupon_code = 'SPRING50',
      |    invoice_status = 'issued',
      |    invoice_title = buyer,
      |    promotion_id = 'promo-spring-growth',
      |    billing_cycle = 'one_time'
      |where id = 'ORD-202603-001'
      |""".stripMargin,
    """
      |insert into edu_coupons (id, code, title, discount_amount, min_amount, valid_from, valid_to, active)
      |values
      |  ('coupon-spring-50', 'SPRING50', '闁哄嫨鍎遍婊堝箮閵夈儲鍊崇紒鏂款儏閸ｆ椽宕?, 50, 199, '2026-02-20T00:00:00Z', '2026-04-30T23:59:59Z', true),
      |  ('coupon-new-30', 'NEW30', '闁哄倹澹嗛弫銈夊箣閻ゎ垼鍤︾紒瀣儏閸?, 30, 99, '2026-01-01T00:00:00Z', '2026-12-31T23:59:59Z', true)
      |on conflict (id) do nothing
      |""".stripMargin,
    """
      |insert into edu_promotions (id, title, description, discount_percent, starts_at, ends_at, active)
      |values
      |  ('promo-spring-growth', '闁哄嫨鍎遍婊堝箣閹扮増姣愰悹浣测偓鍐茬亰', '闂傚牄鍨归幃婊堝棘閺夋鍔呴柡鍫㈠枔濞堟垹鎷犻崜褉鏌ゅǎ鍥у暣閺€銏犆虹拠鎻捫楅柨娑樼焷娴犲牓宕濋妸銈囧枠闁诡垳濮撮崺婊堝椽鐏炵瓔鍔呭☉鏃傚Ь閻儳顕ラ崟顒€鑵归柤鑺ュ姂閳?, 15, '2026-02-20T00:00:00Z', '2026-04-30T23:59:59Z', true),
      |  ('promo-team-learning', '闁绘繍鍘炬鍥炊閵忊€承撴繛鑼额嚙婵?, '闁圭顦伴弳鈧悗娑冲瑜邦噣骞庨妷銉﹀€冲ù婊呭劋閺嗙喖骞撻幇顒€纾抽悹鍥у⒔閳诲吋娼鈧€垫煡鏁嶇仦鐐殰闁归晲娴囩换宥夋媰閵夈倖娅犻弶鈺佲偓鐔煎殝闁硅翰鍎遍幃鏇㈠极閸喓浜柕?, 10, '2026-03-01T00:00:00Z', '2026-06-30T23:59:59Z', true)
      |on conflict (id) do nothing
      |""".stripMargin,
    """
      |insert into edu_invoices (id, order_id, title, amount, status, issued_at)
      |values
      |  ('INV-202603-001', 'ORD-202603-001', 'Lin Zhida', 249, 'issued', '2026-03-23 09:10'),
      |  ('INV-202603-018', 'ORD-202603-018', 'Zhao Ming', 199, 'not_requested', null)
      |on conflict (id) do nothing
      |""".stripMargin,
    """
      |insert into edu_refunds (id, order_id, amount, reason, status, requested_at, processed_at)
      |values ('REF-202603-001', 'ORD-202603-001', 0, 'No refund requested', 'none', '2026-03-22 20:14', null)
      |on conflict (id) do nothing
      |""".stripMargin,
    """
      |insert into edu_resource_assets (
      |  id, course_id, owner_id, filename, content_type, size_bytes, storage_key,
      |  preview_url, download_url, version, visibility, created_at, updated_at
      |)
      |select 'res-ts-architecture-v2', 'ts-fullstack', 'teacher-zhou', 'type-safe-architecture-v2.pdf',
      |       'application/pdf', 2846720, 'courses/ts-fullstack/type-safe-architecture-v2.pdf',
      |       '/resources/preview/res-ts-architecture-v2', '/resources/download/res-ts-architecture-v2',
      |       2, 'course_members', '2026-03-10T09:00:00Z', '2026-04-02T09:00:00Z'
      |where exists (select 1 from edu_courses where id = 'ts-fullstack')
      |  and exists (select 1 from edu_users where id = 'teacher-zhou')
      |on conflict (id) do nothing
      |""".stripMargin
  )

  val listUserMessagesSql: String =
    "select id, sender_name, recipient_name, content, attachment_label, sent_at, read, category, course_id from edu_messages where sender_name = ? or recipient_name = ?"

  val listAllMessagesSql: String =
    "select id, sender_name, recipient_name, content, attachment_label, sent_at, read, category, course_id from edu_messages"

  val orderColumnsSql: String =
    """
      |id, buyer, course_title, amount, status, paid_at, original_amount, discount_amount,
      |payment_state, payment_method, coupon_code, refund_status, refund_amount,
      |invoice_status, invoice_title, promotion_id, billing_cycle
      |""".stripMargin.replace("\n", " ")

  val listStudentOrdersSql: String =
    s"select $orderColumnsSql from edu_orders where buyer = ?"

  val listAllOrdersSql: String =
    s"select $orderColumnsSql from edu_orders order by id asc"

  val listCouponsSql: String =
    """
      |select id, code, title, discount_amount, min_amount, valid_from, valid_to, active
      |from edu_coupons
      |order by active desc, valid_to desc, id asc
      |""".stripMargin

  val listPromotionsSql: String =
    """
      |select id, title, description, discount_percent, starts_at, ends_at, active
      |from edu_promotions
      |order by active desc, starts_at desc, id asc
      |""".stripMargin

  val listStudentInvoicesSql: String =
    """
      |select i.id, i.order_id, i.title, i.amount, i.status, i.issued_at
      |from edu_invoices i
      |left join edu_orders o on o.id = i.order_id
      |where o.buyer = ?
      |order by i.id asc
      |""".stripMargin

  val listAllInvoicesSql: String =
    """
      |select i.id, i.order_id, i.title, i.amount, i.status, i.issued_at
      |from edu_invoices i
      |left join edu_orders o on o.id = i.order_id
      |order by i.id asc
      |""".stripMargin

  val listStudentRefundsSql: String =
    """
      |select r.id, r.order_id, r.amount, r.reason, r.status, r.requested_at, r.processed_at
      |from edu_refunds r
      |left join edu_orders o on o.id = r.order_id
      |where o.buyer = ?
      |order by r.requested_at desc, r.id asc
      |""".stripMargin

  val listAllRefundsSql: String =
    """
      |select r.id, r.order_id, r.amount, r.reason, r.status, r.requested_at, r.processed_at
      |from edu_refunds r
      |left join edu_orders o on o.id = r.order_id
      |order by r.requested_at desc, r.id asc
      |""".stripMargin

  val listStudentResourceAssetsSql: String =
    """
      |select r.id, r.course_id, r.owner_id, r.filename, r.content_type, r.size_bytes,
      |       r.storage_key, r.preview_url, r.download_url, r.version, r.visibility,
      |       r.created_at, r.updated_at
      |from edu_resource_assets r
      |join edu_enrollments e on e.course_id = r.course_id and e.user_id = ?
      |where r.visibility in ('public', 'course_members')
      |order by r.updated_at desc, r.id asc
      |""".stripMargin

  val listTeachingResourceAssetsSql: String =
    """
      |select r.id, r.course_id, r.owner_id, r.filename, r.content_type, r.size_bytes,
      |       r.storage_key, r.preview_url, r.download_url, r.version, r.visibility,
      |       r.created_at, r.updated_at
      |from edu_resource_assets r
      |where r.owner_id = ? or r.visibility <> 'private'
      |order by r.updated_at desc, r.id asc
      |""".stripMargin

  val listAllResourceAssetsSql: String =
    """
      |select r.id, r.course_id, r.owner_id, r.filename, r.content_type, r.size_bytes,
      |       r.storage_key, r.preview_url, r.download_url, r.version, r.visibility,
      |       r.created_at, r.updated_at
      |from edu_resource_assets r
      |order by r.updated_at desc, r.id asc
      |""".stripMargin

  val insertPaidOrderSql: String =
    """
      |insert into edu_orders (id, buyer, course_title, amount, status, paid_at)
      |values (?, ?, ?, ?, ?, ?)
      |""".stripMargin

  def insertPaidOrder(connection: Connection, id: String, buyer: String, courseTitle: String, amount: Int, status: String, paidAt: String): IO[Unit] =
    IO.blocking {
      val statement = connection.prepareStatement(insertPaidOrderSql)
      try
        statement.setObject(1, id)
        statement.setObject(2, buyer)
        statement.setObject(3, courseTitle)
        statement.setObject(4, amount)
        statement.setObject(5, status)
        statement.setObject(6, paidAt)
        statement.executeUpdate()
        ()
      finally statement.close()
    }

  def listMessages(connection: Connection, currentUser: UserProfile): IO[List[MessageThread]] =
    currentUser.role match
      case UserRole.Student | UserRole.Teacher | UserRole.Assistant =>
        selectPreparedList(connection.prepareStatement(listUserMessagesSql)) { statement =>
          statement.setString(1, currentUser.name)
          statement.setString(2, currentUser.name)
        }(readMessage)
      case _ =>
        selectList(connection, listAllMessagesSql)(readMessage)

  def listOrders(connection: Connection, currentUser: UserProfile): IO[List[Order]] =
    if currentUser.role == UserRole.Student then
      selectPreparedList(connection.prepareStatement(listStudentOrdersSql))(_.setString(1, currentUser.name))(readOrder)
    else
      selectList(connection, listAllOrdersSql)(readOrder)

  def listCoupons(connection: Connection): IO[List[Coupon]] =
    selectList(connection, listCouponsSql)(readCoupon)

  def listPromotions(connection: Connection): IO[List[Promotion]] =
    selectList(connection, listPromotionsSql)(readPromotion)

  def listInvoices(connection: Connection, currentUser: UserProfile): IO[List[Invoice]] =
    if currentUser.role == UserRole.Student then
      selectPreparedList(connection.prepareStatement(listStudentInvoicesSql))(_.setString(1, currentUser.name))(readInvoice)
    else
      selectList(connection, listAllInvoicesSql)(readInvoice)

  def listRefunds(connection: Connection, currentUser: UserProfile): IO[List[Refund]] =
    if currentUser.role == UserRole.Student then
      selectPreparedList(connection.prepareStatement(listStudentRefundsSql))(_.setString(1, currentUser.name))(readRefund)
    else
      selectList(connection, listAllRefundsSql)(readRefund)

  def listResourceAssets(connection: Connection, currentUser: UserProfile): IO[List[ResourceAsset]] =
    currentUser.role match
      case UserRole.Student =>
        selectPreparedList(connection.prepareStatement(listStudentResourceAssetsSql))(_.setString(1, currentUser.id))(readResourceAsset)
      case UserRole.Teacher | UserRole.Assistant =>
        selectPreparedList(connection.prepareStatement(listTeachingResourceAssetsSql))(_.setString(1, currentUser.id))(readResourceAsset)
      case _ =>
        selectList(connection, listAllResourceAssetsSql)(readResourceAsset)

  private def selectList[A](connection: Connection, sql: String)(read: ResultSet => A): IO[List[A]] =
    IO.blocking {
      val statement = connection.createStatement()
      try
        val resultSet = statement.executeQuery(sql)
        try readList(resultSet)(read)
        finally resultSet.close()
      finally statement.close()
    }

  private def selectPreparedList[A](statement: PreparedStatement)(bind: PreparedStatement => Unit)(read: ResultSet => A): IO[List[A]] =
    IO.blocking {
      try
        bind(statement)
        val resultSet = statement.executeQuery()
        try readList(resultSet)(read)
        finally resultSet.close()
      finally statement.close()
    }

  private def readList[A](resultSet: ResultSet)(read: ResultSet => A): List[A] =
    val buffer = scala.collection.mutable.ListBuffer.empty[A]
    while resultSet.next() do buffer += read(resultSet)
    buffer.toList

  private def readMessage(resultSet: ResultSet): MessageThread =
    MessageThread(
      id = resultSet.getString("id"),
      from = resultSet.getString("sender_name"),
      to = resultSet.getString("recipient_name"),
      content = resultSet.getString("content"),
      attachmentLabel = Option(resultSet.getString("attachment_label")).filter(_.nonEmpty),
      sentAt = resultSet.getString("sent_at"),
      read = optionalBoolean(resultSet, "read", false),
      category = optionalString(resultSet, "category").getOrElse("message"),
      courseId = optionalString(resultSet, "course_id")
    )

  private def readOrder(resultSet: ResultSet): Order =
    val status = OrderStatus.fromString(resultSet.getString("status")).getOrElse(OrderStatus.Pending)
    Order(
      id = resultSet.getString("id"),
      buyer = resultSet.getString("buyer"),
      courseTitle = resultSet.getString("course_title"),
      amount = resultSet.getInt("amount"),
      status = status,
      paidAt = resultSet.getString("paid_at"),
      originalAmount = optionalInt(resultSet, "original_amount", resultSet.getInt("amount")),
      discountAmount = optionalInt(resultSet, "discount_amount", 0),
      paymentState = optionalString(resultSet, "payment_state").getOrElse(OrderStatus.toString(status)),
      paymentMethod = optionalString(resultSet, "payment_method"),
      couponCode = optionalString(resultSet, "coupon_code"),
      refundStatus = optionalString(resultSet, "refund_status"),
      refundAmount = optionalInt(resultSet, "refund_amount", 0),
      invoiceStatus = optionalString(resultSet, "invoice_status"),
      invoiceTitle = optionalString(resultSet, "invoice_title"),
      promotionId = optionalString(resultSet, "promotion_id"),
      billingCycle = optionalString(resultSet, "billing_cycle")
    )

  private def readCoupon(resultSet: ResultSet): Coupon =
    Coupon(
      id = resultSet.getString("id"),
      code = resultSet.getString("code"),
      title = resultSet.getString("title"),
      discountAmount = resultSet.getInt("discount_amount"),
      minAmount = resultSet.getInt("min_amount"),
      validFrom = resultSet.getString("valid_from"),
      validTo = resultSet.getString("valid_to"),
      active = resultSet.getBoolean("active")
    )

  private def readPromotion(resultSet: ResultSet): Promotion =
    Promotion(
      id = resultSet.getString("id"),
      title = resultSet.getString("title"),
      description = resultSet.getString("description"),
      discountPercent = resultSet.getInt("discount_percent"),
      startsAt = resultSet.getString("starts_at"),
      endsAt = resultSet.getString("ends_at"),
      active = resultSet.getBoolean("active")
    )

  private def readInvoice(resultSet: ResultSet): Invoice =
    Invoice(
      id = resultSet.getString("id"),
      orderId = resultSet.getString("order_id"),
      title = resultSet.getString("title"),
      amount = resultSet.getInt("amount"),
      status = resultSet.getString("status"),
      issuedAt = optionalString(resultSet, "issued_at")
    )

  private def readRefund(resultSet: ResultSet): Refund =
    Refund(
      id = resultSet.getString("id"),
      orderId = resultSet.getString("order_id"),
      amount = resultSet.getInt("amount"),
      reason = resultSet.getString("reason"),
      status = resultSet.getString("status"),
      requestedAt = resultSet.getString("requested_at"),
      processedAt = optionalString(resultSet, "processed_at")
    )

  private def readResourceAsset(resultSet: ResultSet): ResourceAsset =
    ResourceAsset(
      id = resultSet.getString("id"),
      courseId = resultSet.getString("course_id"),
      ownerId = resultSet.getString("owner_id"),
      filename = resultSet.getString("filename"),
      contentType = resultSet.getString("content_type"),
      sizeBytes = resultSet.getLong("size_bytes"),
      storageKey = resultSet.getString("storage_key"),
      previewUrl = resultSet.getString("preview_url"),
      downloadUrl = resultSet.getString("download_url"),
      version = resultSet.getInt("version"),
      visibility = resultSet.getString("visibility"),
      createdAt = resultSet.getString("created_at"),
      updatedAt = resultSet.getString("updated_at")
    )

  private def optionalString(resultSet: ResultSet, column: String): Option[String] =
    try Option(resultSet.getString(column)).filter(_.nonEmpty)
    catch
      case _: Throwable => None

  private def optionalInt(resultSet: ResultSet, column: String, default: Int): Int =
    try Option(resultSet.getObject(column)).map(_.toString.toInt).getOrElse(default)
    catch
      case _: Throwable => default

  private def optionalBoolean(resultSet: ResultSet, column: String, default: Boolean): Boolean =
    try resultSet.getBoolean(column)
    catch
      case _: Throwable => default
