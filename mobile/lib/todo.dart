import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:table_calendar/table_calendar.dart';

class Todo extends StatefulWidget {
  const Todo({super.key});

  @override
  State<Todo> createState() => _TodoState();
}

class _TodoState extends State<Todo> {
  CalendarFormat _calendarFormat = CalendarFormat.month;
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                const SizedBox(height: 150, width: 20),
                Container(
                  child: const Text('Menu'),
                ),
                const SizedBox(width: 200),
                Container(
                  child: Image.asset('assets/img/logo2.png',
                      height: 40, width: 140),
                ),
              ],
            ),
            //const SizedBox(height: 20),
            Container(
              child: const Text(
                'Manage your To-Do List',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(
              height: 50,
            ),
            Container(
              child: ElevatedButton(
                onPressed: () {},
                child: const Text('+ Add New Task',
                    style: TextStyle(fontSize: 18)),
              ),
            ),

            Container(
              padding: const EdgeInsets.all(20),
              child: TableCalendar(
                firstDay: DateTime.now(),
                lastDay: DateTime.now().add(const Duration(
                    days: 365)), // Set last day to 1 year from now
                focusedDay: DateTime.now(), // Required parameter - set to today
              ),
            )
          ],
        ),
      ),
    );
  }
}
