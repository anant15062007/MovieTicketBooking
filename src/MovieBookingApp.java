import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.Vector;

public class MovieBookingApp extends JFrame {

    private static final String DB_URL = "jdbc:postgresql://localhost:5432/Movie_ticket_booking_sysem";
    private static final String DB_USER = "postgres";
    private static final String DB_PASS = "postgres";

    private JTabbedPane tabbedPane;
    private Connection conn;

    public MovieBookingApp() {
        setTitle("Movie Ticket Booking System");
        setValueTheme();
        setSize(1250, 750);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        connectDatabase();

        tabbedPane = new JTabbedPane();
        tabbedPane.setFont(new Font("SansSerif", Font.BOLD, 13));

        tabbedPane.addTab("CUSTOMERS", createCustomersPanel());
        tabbedPane.addTab("THEATRES", createTheatresPanel());
        tabbedPane.addTab("MOVIES", createMoviesPanel());
        tabbedPane.addTab("SHOWS", createShowsPanel());
        tabbedPane.addTab("BOOKINGS", createBookingsPanel());
        tabbedPane.addTab("TICKETS", createTicketsPanel());

        tabbedPane.addChangeListener(e -> refreshActiveTab());
        add(tabbedPane);
    }

    private void setValueTheme() {
        UIManager.put("Panel.background", Color.WHITE);
        UIManager.put("Table.background", Color.WHITE);
        UIManager.put("Table.foreground", Color.BLACK);
        UIManager.put("TableHeader.background", new Color(245, 245, 245));
        UIManager.put("TableHeader.foreground", Color.BLACK);
        UIManager.put("TabbedPane.background", Color.WHITE);
        UIManager.put("TabbedPane.foreground", Color.BLACK);
    }

    private void connectDatabase() {
        try {
            Class.forName("org.postgresql.Driver");
            conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
        } catch (Exception e) {
            JOptionPane.showMessageDialog(this, "Database Connection Error: " + e.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
            System.exit(1);
        }
    }

    private JTable createTableWithHiddenId(String query) {
        DefaultTableModel model = new DefaultTableModel();
        JTable table = new JTable(model);
        table.setRowHeight(28);
        table.setFont(new Font("SansSerif", Font.PLAIN, 12));
        table.getTableHeader().setFont(new Font("SansSerif", Font.BOLD, 12));

        try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(query)) {
            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();

            Vector<String> columns = new Vector<>();
            for (int i = 1; i <= columnCount; i++) {
                String colName = metaData.getColumnName(i);
                if (i == 1 || (!colName.toLowerCase().endsWith("_id") && !colName.equalsIgnoreCase("price"))) {
                    columns.add(colName);
                }
            }

            model.setColumnIdentifiers(columns);
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

            while (rs.next()) {
                Vector<Object> row = new Vector<>();
                for (int i = 1; i <= columnCount; i++) {
                    if (i == 1 || (!metaData.getColumnName(i).toLowerCase().endsWith("_id") && !metaData.getColumnName(i).equalsIgnoreCase("price"))) {
                        Object val = rs.getObject(i);
                        if (val instanceof java.sql.Date || val instanceof java.sql.Timestamp) {
                            val = dateFormat.format(val);
                        } else if (val instanceof java.sql.Time) {
                            val = val.toString().split("\\.")[0];
                        }
                        row.add(val != null ? val : "");
                    }
                }
                model.addRow(row);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        if (table.getColumnCount() > 0) {
            table.getColumnModel().getColumn(0).setMinWidth(0);
            table.getColumnModel().getColumn(0).setMaxWidth(0);
            table.getColumnModel().getColumn(0).setWidth(0);
        }

        return table;
    }

    private void refreshActiveTab() {
        int index = tabbedPane.getSelectedIndex();
        switch (index) {
            case 0 -> tabbedPane.setComponentAt(0, createCustomersPanel());
            case 1 -> tabbedPane.setComponentAt(1, createTheatresPanel());
            case 2 -> tabbedPane.setComponentAt(2, createMoviesPanel());
            case 3 -> tabbedPane.setComponentAt(3, createShowsPanel());
            case 4 -> tabbedPane.setComponentAt(4, createBookingsPanel());
            case 5 -> tabbedPane.setComponentAt(5, createTicketsPanel());
        }
    }

    // 1. CUSTOMERS PANEL
    private JPanel createCustomersPanel() {
        JPanel mainPanel = new JPanel(new BorderLayout());
        mainPanel.setBackground(Color.WHITE);

        JPanel formPanel = new JPanel(new GridBagLayout());
        formPanel.setBackground(Color.WHITE);
        formPanel.setBorder(BorderFactory.createEmptyBorder(15, 10, 15, 10));
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(5, 5, 5, 5);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        JTextField firstNameField = new JTextField(10);
        JTextField middleNameField = new JTextField(10);
        JTextField lastNameField = new JTextField(10);
        JTextField emailField = new JTextField(12);
        JTextField phoneField = new JTextField(10);
        JTextField dobField = new JTextField("YYYY-MM-DD", 10);
        JButton insertBtn = new JButton("Insert");

        int x = 0;
        formPanel.add(new JLabel("First Name:"), gbcCoords(gbc, x++, 0));
        formPanel.add(firstNameField, gbcCoords(gbc, x++, 0));
        formPanel.add(new JLabel("Middle:"), gbcCoords(gbc, x++, 0));
        formPanel.add(middleNameField, gbcCoords(gbc, x++, 0));
        formPanel.add(new JLabel("Last Name:"), gbcCoords(gbc, x++, 0));
        formPanel.add(lastNameField, gbcCoords(gbc, x++, 0));

        x = 0;
        formPanel.add(new JLabel("Email:"), gbcCoords(gbc, x++, 1));
        formPanel.add(emailField, gbcCoords(gbc, x++, 1));
        formPanel.add(new JLabel("Phone:"), gbcCoords(gbc, x++, 1));
        formPanel.add(phoneField, gbcCoords(gbc, x++, 1));
        formPanel.add(new JLabel("DOB:"), gbcCoords(gbc, x++, 1));
        formPanel.add(dobField, gbcCoords(gbc, x++, 1));
        formPanel.add(insertBtn, gbcCoords(gbc, x++, 1));

        mainPanel.add(formPanel, BorderLayout.NORTH);

        String query = "SELECT c.customer_id, c.first_name, c.middle_name, c.last_name, c.email, c.password_hash, c.date_of_birth, cp.phone_number FROM customers c LEFT JOIN customer_phones cp ON c.customer_id = cp.customer_id ORDER BY c.customer_id ASC";
        JTable table = createTableWithHiddenId(query);
        mainPanel.add(new JScrollPane(table), BorderLayout.CENTER);

        JPanel actionPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 15, 10));
        actionPanel.setBackground(Color.WHITE);
        JButton deleteBtn = new JButton("Delete Selected");
        JButton editBtn = new JButton("Edit Selected");
        actionPanel.add(editBtn);
        actionPanel.add(deleteBtn);
        mainPanel.add(actionPanel, BorderLayout.SOUTH);

        insertBtn.addActionListener(e -> {
            try {
                conn.setAutoCommit(false);
                PreparedStatement ps = conn.prepareStatement("INSERT INTO customers (first_name, middle_name, last_name, email, password_hash, date_of_birth) VALUES (?, ?, ?, ?, ?, ?::date) RETURNING customer_id");
                ps.setString(1, firstNameField.getText());
                ps.setString(2, middleNameField.getText());
                ps.setString(3, lastNameField.getText());
                ps.setString(4, emailField.getText());
                ps.setString(5, "password123");
                ps.setString(6, dobField.getText());

                ResultSet rs = ps.executeQuery();
                if (rs.next() && !phoneField.getText().trim().isEmpty()) {
                    int customerId = rs.getInt(1);
                    PreparedStatement psPhone = conn.prepareStatement("INSERT INTO customer_phones (customer_id, phone_number) VALUES (?, ?)");
                    psPhone.setInt(1, customerId);
                    psPhone.setString(2, phoneField.getText().trim());
                    psPhone.executeUpdate();
                }
                conn.commit();
                conn.setAutoCommit(true);
                JOptionPane.showMessageDialog(this, "Customer Inserted!");
                tabbedPane.setComponentAt(0, createCustomersPanel());
            } catch (Exception ex) {
                try { conn.rollback(); } catch (SQLException rollbackEx) {}
                JOptionPane.showMessageDialog(this, "Error: " + ex.getMessage());
            }
        });

        deleteBtn.addActionListener(e -> {
            int row = table.getSelectedRow();
            if (row == -1) { JOptionPane.showMessageDialog(this, "Please select a customer row to delete."); return; }
            int id = (int) table.getModel().getValueAt(row, 0);
            try {
                PreparedStatement ps = conn.prepareStatement("DELETE FROM customers WHERE customer_id = ?");
                ps.setInt(1, id);
                ps.executeUpdate();
                JOptionPane.showMessageDialog(this, "Customer Deleted!");
                tabbedPane.setComponentAt(0, createCustomersPanel());
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Delete Error: " + ex.getMessage());
            }
        });

        editBtn.addActionListener(e -> {
            int row = table.getSelectedRow();
            if (row == -1) { JOptionPane.showMessageDialog(this, "Please select a customer row to edit."); return; }
            int id = (int) table.getModel().getValueAt(row, 0);

            JTextField f1 = new JTextField(String.valueOf(table.getModel().getValueAt(row, 1)), 10);
            JTextField f2 = new JTextField(String.valueOf(table.getModel().getValueAt(row, 2)), 10);
            JTextField f3 = new JTextField(String.valueOf(table.getModel().getValueAt(row, 3)), 10);
            JTextField f4 = new JTextField(String.valueOf(table.getModel().getValueAt(row, 4)), 10);
            JTextField f5 = new JTextField(String.valueOf(table.getModel().getValueAt(row, 5)), 10);
            JTextField f6 = new JTextField(String.valueOf(table.getModel().getValueAt(row, 6)), 10);
            JTextField f7 = new JTextField(String.valueOf(table.getModel().getValueAt(row, 7)), 10);

            JPanel editPanel = new JPanel(new GridLayout(7, 2, 5, 5));
            editPanel.add(new JLabel("First Name:")); editPanel.add(f1);
            editPanel.add(new JLabel("Middle Name:")); editPanel.add(f2);
            editPanel.add(new JLabel("Last Name:")); editPanel.add(f3);
            editPanel.add(new JLabel("Email:")); editPanel.add(f4);
            editPanel.add(new JLabel("Password Hash:")); editPanel.add(f5);
            editPanel.add(new JLabel("DOB (YYYY-MM-DD):")); editPanel.add(f6);
            editPanel.add(new JLabel("Phone Number:")); editPanel.add(f7);

            int result = JOptionPane.showConfirmDialog(null, editPanel, "Edit Customer", JOptionPane.OK_CANCEL_OPTION);
            if (result == JOptionPane.OK_OPTION) {
                try {
                    conn.setAutoCommit(false);
                    PreparedStatement ps = conn.prepareStatement("UPDATE customers SET first_name=?, middle_name=?, last_name=?, email=?, password_hash=?, date_of_birth=?::date WHERE customer_id=?");
                    ps.setString(1, f1.getText());
                    ps.setString(2, f2.getText());
                    ps.setString(3, f3.getText());
                    ps.setString(4, f4.getText());
                    ps.setString(5, f5.getText());
                    ps.setString(6, f6.getText());
                    ps.setInt(7, id);
                    ps.executeUpdate();

                    // Update phone number
                    PreparedStatement psDelPhone = conn.prepareStatement("DELETE FROM customer_phones WHERE customer_id = ?");
                    psDelPhone.setInt(1, id);
                    psDelPhone.executeUpdate();

                    if (!f7.getText().trim().isEmpty()) {
                        PreparedStatement psPhone = conn.prepareStatement("INSERT INTO customer_phones (customer_id, phone_number) VALUES (?, ?)");
                        psPhone.setInt(1, id);
                        psPhone.setString(2, f7.getText().trim());
                        psPhone.executeUpdate();
                    }

                    conn.commit();
                    conn.setAutoCommit(true);
                    JOptionPane.showMessageDialog(this, "Customer Updated!");
                    tabbedPane.setComponentAt(0, createCustomersPanel());
                } catch (Exception ex) {
                    try { conn.rollback(); } catch (SQLException rollbackEx) {}
                    JOptionPane.showMessageDialog(this, "Update Error: " + ex.getMessage());
                }
            }
        });

        return mainPanel;
    }

    // 2. THEATRES PANEL
    private JPanel createTheatresPanel() {
        JPanel mainPanel = new JPanel(new BorderLayout());
        mainPanel.setBackground(Color.WHITE);

        JPanel formPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 15));
        formPanel.setBackground(Color.WHITE);

        JTextField nameField = new JTextField(12);
        JTextField locationField = new JTextField(12);
        JTextField screensField = new JTextField(5);
        JButton insertBtn = new JButton("Insert");

        formPanel.add(new JLabel("Theatre Name:")); formPanel.add(nameField);
        formPanel.add(new JLabel("Location:")); formPanel.add(locationField);
        formPanel.add(new JLabel("Total Screens:")); formPanel.add(screensField);
        formPanel.add(insertBtn);

        mainPanel.add(formPanel, BorderLayout.NORTH);

        JTable table = createTableWithHiddenId("SELECT theatre_id, theatre_name, location, total_screens FROM theatres ORDER BY theatre_id ASC");
        mainPanel.add(new JScrollPane(table), BorderLayout.CENTER);

        JPanel actionPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 15, 10));
        actionPanel.setBackground(Color.WHITE);
        JButton deleteBtn = new JButton("Delete Selected");
        JButton editBtn = new JButton("Edit Selected");
        actionPanel.add(editBtn); actionPanel.add(deleteBtn);
        mainPanel.add(actionPanel, BorderLayout.SOUTH);

        insertBtn.addActionListener(e -> {
            try {
                PreparedStatement ps = conn.prepareStatement("INSERT INTO theatres (theatre_name, location, total_screens) VALUES (?, ?, ?)");
                ps.setString(1, nameField.getText());
                ps.setString(2, locationField.getText());
                ps.setInt(3, Integer.parseInt(screensField.getText()));
                ps.executeUpdate();
                JOptionPane.showMessageDialog(this, "Theatre Added!");
                tabbedPane.setComponentAt(1, createTheatresPanel());
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Error: " + ex.getMessage());
            }
        });

        deleteBtn.addActionListener(e -> {
            int row = table.getSelectedRow();
            if (row == -1) { JOptionPane.showMessageDialog(this, "Please select a theatre."); return; }
            int id = (int) table.getModel().getValueAt(row, 0);
            try {
                PreparedStatement ps = conn.prepareStatement("DELETE FROM theatres WHERE theatre_id = ?");
                ps.setInt(1, id);
                ps.executeUpdate();
                JOptionPane.showMessageDialog(this, "Theatre Deleted!");
                tabbedPane.setComponentAt(1, createTheatresPanel());
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Delete Error: " + ex.getMessage());
            }
        });

        editBtn.addActionListener(e -> {
            int row = table.getSelectedRow();
            if (row == -1) { JOptionPane.showMessageDialog(this, "Please select a theatre."); return; }
            int id = (int) table.getModel().getValueAt(row, 0);

            JTextField f1 = new JTextField(String.valueOf(table.getModel().getValueAt(row, 1)), 12);
            JTextField f2 = new JTextField(String.valueOf(table.getModel().getValueAt(row, 2)), 12);
            JTextField f3 = new JTextField(String.valueOf(table.getModel().getValueAt(row, 3)), 5);

            JPanel editPanel = new JPanel(new GridLayout(3, 2, 5, 5));
            editPanel.add(new JLabel("Theatre Name:")); editPanel.add(f1);
            editPanel.add(new JLabel("Location:")); editPanel.add(f2);
            editPanel.add(new JLabel("Screens:")); editPanel.add(f3);

            int result = JOptionPane.showConfirmDialog(null, editPanel, "Edit Theatre", JOptionPane.OK_CANCEL_OPTION);
            if (result == JOptionPane.OK_OPTION) {
                try {
                    PreparedStatement ps = conn.prepareStatement("UPDATE theatres SET theatre_name=?, location=?, total_screens=? WHERE theatre_id=?");
                    ps.setString(1, f1.getText());
                    ps.setString(2, f2.getText());
                    ps.setInt(3, Integer.parseInt(f3.getText()));
                    ps.setInt(4, id);
                    ps.executeUpdate();
                    JOptionPane.showMessageDialog(this, "Theatre Updated!");
                    tabbedPane.setComponentAt(1, createTheatresPanel());
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(this, "Update Error: " + ex.getMessage());
                }
            }
        });

        return mainPanel;
    }

    // 3. MOVIES PANEL
    private JPanel createMoviesPanel() {
        JPanel mainPanel = new JPanel(new BorderLayout());
        mainPanel.setBackground(Color.WHITE);

        JPanel formPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 15));
        formPanel.setBackground(Color.WHITE);

        JTextField titleField = new JTextField(12);
        JTextField langField = new JTextField(8);
        JTextField genreField = new JTextField(8);
        JTextField durationField = new JTextField(5);
        JButton insertBtn = new JButton("Insert");

        formPanel.add(new JLabel("Title:")); formPanel.add(titleField);
        formPanel.add(new JLabel("Language:")); formPanel.add(langField);
        formPanel.add(new JLabel("Genre:")); formPanel.add(genreField);
        formPanel.add(new JLabel("Duration (mins):")); formPanel.add(durationField);
        formPanel.add(insertBtn);

        mainPanel.add(formPanel, BorderLayout.NORTH);

        JTable table = createTableWithHiddenId("SELECT movie_id, title, language, genre, duration_minutes FROM movies ORDER BY movie_id ASC");
        mainPanel.add(new JScrollPane(table), BorderLayout.CENTER);

        JPanel actionPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 15, 10));
        actionPanel.setBackground(Color.WHITE);
        JButton deleteBtn = new JButton("Delete Selected");
        JButton editBtn = new JButton("Edit Selected");
        actionPanel.add(editBtn); actionPanel.add(deleteBtn);
        mainPanel.add(actionPanel, BorderLayout.SOUTH);

        insertBtn.addActionListener(e -> {
            try {
                PreparedStatement ps = conn.prepareStatement("INSERT INTO movies (title, language, genre, duration_minutes) VALUES (?, ?, ?, ?)");
                ps.setString(1, titleField.getText());
                ps.setString(2, langField.getText());
                ps.setString(3, genreField.getText());
                ps.setInt(4, Integer.parseInt(durationField.getText()));
                ps.executeUpdate();
                JOptionPane.showMessageDialog(this, "Movie Added!");
                tabbedPane.setComponentAt(2, createMoviesPanel());
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Error: " + ex.getMessage());
            }
        });

        deleteBtn.addActionListener(e -> {
            int row = table.getSelectedRow();
            if (row == -1) { JOptionPane.showMessageDialog(this, "Please select a movie."); return; }
            int id = (int) table.getModel().getValueAt(row, 0);
            try {
                PreparedStatement ps = conn.prepareStatement("DELETE FROM movies WHERE movie_id = ?");
                ps.setInt(1, id);
                ps.executeUpdate();
                JOptionPane.showMessageDialog(this, "Movie Deleted!");
                tabbedPane.setComponentAt(2, createMoviesPanel());
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Delete Error: " + ex.getMessage());
            }
        });

        editBtn.addActionListener(e -> {
            int row = table.getSelectedRow();
            if (row == -1) { JOptionPane.showMessageDialog(this, "Please select a movie."); return; }
            int id = (int) table.getModel().getValueAt(row, 0);

            JTextField f1 = new JTextField(String.valueOf(table.getModel().getValueAt(row, 1)), 12);
            JTextField f2 = new JTextField(String.valueOf(table.getModel().getValueAt(row, 2)), 8);
            JTextField f3 = new JTextField(String.valueOf(table.getModel().getValueAt(row, 3)), 8);
            JTextField f4 = new JTextField(String.valueOf(table.getModel().getValueAt(row, 4)), 5);

            JPanel editPanel = new JPanel(new GridLayout(4, 2, 5, 5));
            editPanel.add(new JLabel("Title:")); editPanel.add(f1);
            editPanel.add(new JLabel("Language:")); editPanel.add(f2);
            editPanel.add(new JLabel("Genre:")); editPanel.add(f3);
            editPanel.add(new JLabel("Duration:")); editPanel.add(f4);

            int result = JOptionPane.showConfirmDialog(null, editPanel, "Edit Movie", JOptionPane.OK_CANCEL_OPTION);
            if (result == JOptionPane.OK_OPTION) {
                try {
                    PreparedStatement ps = conn.prepareStatement("UPDATE movies SET title=?, language=?, genre=?, duration_minutes=? WHERE movie_id=?");
                    ps.setString(1, f1.getText());
                    ps.setString(2, f2.getText());
                    ps.setString(3, f3.getText());
                    ps.setInt(4, Integer.parseInt(f4.getText()));
                    ps.setInt(5, id);
                    ps.executeUpdate();
                    JOptionPane.showMessageDialog(this, "Movie Updated!");
                    tabbedPane.setComponentAt(2, createMoviesPanel());
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(this, "Update Error: " + ex.getMessage());
                }
            }
        });

        return mainPanel;
    }

    // 4. SHOWS PANEL
    private JPanel createShowsPanel() {
        JPanel mainPanel = new JPanel(new BorderLayout());
        mainPanel.setBackground(Color.WHITE);

        JPanel formPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 15));
        formPanel.setBackground(Color.WHITE);

        JTextField theatreIdField = new JTextField(5);
        JTextField movieIdField = new JTextField(5);
        JTextField dateField = new JTextField("YYYY-MM-DD", 8);
        JTextField timeField = new JTextField("HH:MM:SS", 8);
        JTextField langField = new JTextField(8);
        JButton insertBtn = new JButton("Insert");

        formPanel.add(new JLabel("Theatre ID:")); formPanel.add(theatreIdField);
        formPanel.add(new JLabel("Movie ID:")); formPanel.add(movieIdField);
        formPanel.add(new JLabel("Date:")); formPanel.add(dateField);
        formPanel.add(new JLabel("Time:")); formPanel.add(timeField);
        formPanel.add(new JLabel("Language:")); formPanel.add(langField);
        formPanel.add(insertBtn);

        mainPanel.add(formPanel, BorderLayout.NORTH);

        String query = "SELECT s.show_id, s.show_date, s.show_time, s.language, m.title AS movie_title, t.theatre_name " +
                       "FROM shows s JOIN movies m ON s.movie_id = m.movie_id JOIN theatres t ON s.theatre_id = t.theatre_id ORDER BY s.show_id ASC";
        JTable table = createTableWithHiddenId(query);
        mainPanel.add(new JScrollPane(table), BorderLayout.CENTER);

        JPanel actionPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 15, 10));
        actionPanel.setBackground(Color.WHITE);
        JButton deleteBtn = new JButton("Delete Selected");
        actionPanel.add(deleteBtn);
        mainPanel.add(actionPanel, BorderLayout.SOUTH);

        insertBtn.addActionListener(e -> {
            try {
                PreparedStatement ps = conn.prepareStatement("INSERT INTO shows (theatre_id, movie_id, show_date, show_time, language) VALUES (?, ?, ?::date, ?::time, ?)");
                ps.setInt(1, Integer.parseInt(theatreIdField.getText()));
                ps.setInt(2, Integer.parseInt(movieIdField.getText()));
                ps.setString(3, dateField.getText());
                ps.setString(4, timeField.getText());
                ps.setString(5, langField.getText());
                ps.executeUpdate();
                JOptionPane.showMessageDialog(this, "Show Created!");
                tabbedPane.setComponentAt(3, createShowsPanel());
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Error: " + ex.getMessage());
            }
        });

        deleteBtn.addActionListener(e -> {
            int row = table.getSelectedRow();
            if (row == -1) { JOptionPane.showMessageDialog(this, "Please select a show."); return; }
            int id = (int) table.getModel().getValueAt(row, 0);
            try {
                PreparedStatement ps = conn.prepareStatement("DELETE FROM shows WHERE show_id = ?");
                ps.setInt(1, id);
                ps.executeUpdate();
                JOptionPane.showMessageDialog(this, "Show Deleted!");
                tabbedPane.setComponentAt(3, createShowsPanel());
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Delete Error: " + ex.getMessage());
            }
        });

        return mainPanel;
    }

    // 5. BOOKINGS PANEL
    private JPanel createBookingsPanel() {
        JPanel mainPanel = new JPanel(new BorderLayout());
        mainPanel.setBackground(Color.WHITE);

        JPanel formPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 15));
        formPanel.setBackground(Color.WHITE);

        JComboBox<String> customerCombo = new JComboBox<>();
        JComboBox<String> showCombo = new JComboBox<>();
        JTextField seatField = new JTextField(8);
        JTextField hallField = new JTextField(5);
        JButton bookBtn = new JButton("Book Ticket");

        try {
            Statement stmt = conn.createStatement();
            ResultSet rsCust = stmt.executeQuery("SELECT customer_id, first_name, last_name, email FROM customers");
            while (rsCust.next()) {
                customerCombo.addItem(rsCust.getInt("customer_id") + " - " + rsCust.getString("first_name") + " " + rsCust.getString("last_name"));
            }

            ResultSet rsShows = stmt.executeQuery("SELECT s.show_id, m.title, t.theatre_name FROM shows s JOIN movies m ON s.movie_id = m.movie_id JOIN theatres t ON s.theatre_id = t.theatre_id");
            while (rsShows.next()) {
                showCombo.addItem(rsShows.getInt("show_id") + " - " + rsShows.getString("title") + " @ " + rsShows.getString("theatre_name"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        formPanel.add(new JLabel("Customer:")); formPanel.add(customerCombo);
        formPanel.add(new JLabel("Show:")); formPanel.add(showCombo);
        formPanel.add(new JLabel("Seat(s):")); formPanel.add(seatField);
        formPanel.add(new JLabel("Hall:")); formPanel.add(hallField);
        formPanel.add(bookBtn);

        mainPanel.add(formPanel, BorderLayout.NORTH);

        String query = "SELECT b.booking_id, b.booking_date, b.booking_time, b.total_amount, c.first_name, c.last_name, " +
                       "COUNT(t.ticket_id) AS number_of_seats, STRING_AGG(t.seat_number, ', ') AS seat_numbers, MAX(t.hall_number) AS hall_number " +
                       "FROM bookings b " +
                       "JOIN customers c ON b.customer_id = c.customer_id " +
                       "LEFT JOIN tickets t ON b.booking_id = t.booking_id " +
                       "GROUP BY b.booking_id, c.first_name, c.last_name " +
                       "ORDER BY b.booking_id DESC";

        JTable table = createTableWithHiddenId(query);
        mainPanel.add(new JScrollPane(table), BorderLayout.CENTER);

        JPanel actionPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 15, 10));
        actionPanel.setBackground(Color.WHITE);
        JButton deleteBtn = new JButton("Delete Selected");
        actionPanel.add(deleteBtn);
        mainPanel.add(actionPanel, BorderLayout.SOUTH);

        bookBtn.addActionListener(e -> {
            try {
                conn.setAutoCommit(false);
                int custId = Integer.parseInt(customerCombo.getSelectedItem().toString().split(" - ")[0]);
                int showId = Integer.parseInt(showCombo.getSelectedItem().toString().split(" - ")[0]);
                String seatsInput = seatField.getText().trim();
                int hallNo = Integer.parseInt(hallField.getText().trim());

                String[] seats = seatsInput.split(",");
                double pricePerSeat = 15.00;
                double totalAmount = seats.length * pricePerSeat;

                PreparedStatement psB = conn.prepareStatement("INSERT INTO bookings (customer_id, total_amount) VALUES (?, ?) RETURNING booking_id");
                psB.setInt(1, custId);
                psB.setDouble(2, totalAmount);
                ResultSet rsB = psB.executeQuery();

                if (rsB.next()) {
                    int bookingId = rsB.getInt(1);
                    for (String seat : seats) {
                        String trimmedSeat = seat.trim();
                        if (!trimmedSeat.isEmpty()) {
                            PreparedStatement psT = conn.prepareStatement("INSERT INTO tickets (booking_id, show_id, seat_number, hall_number, price) VALUES (?, ?, ?, ?, ?)");
                            psT.setInt(1, bookingId);
                            psT.setInt(2, showId);
                            psT.setString(3, trimmedSeat);
                            psT.setInt(4, hallNo);
                            psT.setDouble(5, pricePerSeat);
                            psT.executeUpdate();
                        }
                    }
                }

                conn.commit();
                conn.setAutoCommit(true);
                JOptionPane.showMessageDialog(this, "Ticket(s) Booked Successfully!");
                tabbedPane.setComponentAt(4, createBookingsPanel());
            } catch (Exception ex) {
                try { conn.rollback(); } catch (SQLException rollbackEx) {}
                JOptionPane.showMessageDialog(this, "Booking Failed: " + ex.getMessage());
            }
        });

        deleteBtn.addActionListener(e -> {
            int row = table.getSelectedRow();
            if (row == -1) { JOptionPane.showMessageDialog(this, "Please select a booking."); return; }
            int id = (int) table.getModel().getValueAt(row, 0);
            try {
                PreparedStatement ps = conn.prepareStatement("DELETE FROM bookings WHERE booking_id = ?");
                ps.setInt(1, id);
                ps.executeUpdate();
                JOptionPane.showMessageDialog(this, "Booking Deleted!");
                tabbedPane.setComponentAt(4, createBookingsPanel());
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Delete Error: " + ex.getMessage());
            }
        });

        return mainPanel;
    }

    // 6. TICKETS PANEL
    private JPanel createTicketsPanel() {
        JPanel mainPanel = new JPanel(new BorderLayout());
        mainPanel.setBackground(Color.WHITE);

        JLabel infoLabel = new JLabel("Individual tickets are automatically created and managed via the Bookings Tab.", SwingConstants.CENTER);
        infoLabel.setFont(new Font("SansSerif", Font.ITALIC, 13));
        infoLabel.setBorder(BorderFactory.createEmptyBorder(10, 0, 10, 0));
        mainPanel.add(infoLabel, BorderLayout.NORTH);

        String query = "SELECT t.ticket_id, t.seat_number, t.hall_number, m.title AS movie_title, th.theatre_name, c.first_name, c.last_name " +
                       "FROM tickets t JOIN bookings b ON t.booking_id = b.booking_id JOIN customers c ON b.customer_id = c.customer_id " +
                       "JOIN shows s ON t.show_id = s.show_id JOIN movies m ON s.movie_id = m.movie_id JOIN theatres th ON s.theatre_id = th.theatre_id ORDER BY t.ticket_id DESC";
        JTable table = createTableWithHiddenId(query);
        mainPanel.add(new JScrollPane(table), BorderLayout.CENTER);

        return mainPanel;
    }

    private GridBagConstraints gbcCoords(GridBagConstraints gbc, int x, int y) {
        gbc.gridx = x;
        gbc.gridy = y;
        return gbc;
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new MovieBookingApp().setVisible(true));
    }
}