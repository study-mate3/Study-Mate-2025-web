import 'package:flutter/material.dart';
import 'dart:async';

void main() {
  runApp(const PomodoroApp());
}

class PomodoroApp extends StatelessWidget {
  const PomodoroApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pomodoro Timer',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const TimerScreen(),
    );
  }
}

class TimerScreen extends StatefulWidget {
  const TimerScreen({Key? key}) : super(key: key);

  @override
  _TimerScreenState createState() => _TimerScreenState();
}

class _TimerScreenState extends State<TimerScreen> {
  int workTime = 25 * 60; // default work time in seconds
  int shortBreak = 5 * 60; // default short break in seconds
  int longBreak = 20 * 60; // default long break in seconds
  int currentTime = 25 * 60;
  bool isRunning = false;
  bool isBreak = false;
  Timer? timer;
  int totalDuration = 25 * 60; // Tracks the total time for progress animation

  void startTimer() {
    if (isRunning) return;
    setState(() => isRunning = true);

    timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (currentTime > 0) {
        setState(() => currentTime--);
      } else {
        timer.cancel();
        setState(() {
          isRunning = false;
          if (!isBreak) {
            startBreak();
          }
        });
      }
    });
  }

  void startBreak() {
    setState(() {
      isBreak = true;
      currentTime = shortBreak; // Default to short break
      totalDuration =
          shortBreak; // Update total duration for progress calculation
    });
    startTimer();
  }

  void pauseTimer() {
    setState(() {
      timer?.cancel();
      isRunning = false;
    });
  }

  void resetTimer(int time) {
    setState(() {
      timer?.cancel();
      currentTime = time;
      totalDuration = time; // Update total duration for progress calculation
      isRunning = false;
      isBreak = false;
    });
  }

  String formatTime(int seconds) {
    int minutes = seconds ~/ 60;
    int secs = seconds % 60;
    return '$minutes:${secs.toString().padLeft(2, '0')}';
  }

  void showWorkOptions() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text(
            'Select Pomodoro Mode',
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                title: const Text('Popular - 20min Work, 5min Break'),
                onTap: () {
                  resetTimer(20 * 60);
                  shortBreak = 5 * 60;
                  Navigator.of(context).pop();
                },
              ),
              ListTile(
                title: const Text('Medium - 40min Work, 8min Break'),
                onTap: () {
                  resetTimer(40 * 60);
                  shortBreak = 8 * 60;
                  Navigator.of(context).pop();
                },
              ),
              ListTile(
                title: const Text('Extended - 60min Work, 10min Break'),
                onTap: () {
                  resetTimer(60 * 60);
                  shortBreak = 10 * 60;
                  Navigator.of(context).pop();
                },
              ),
              ListTile(
                title: const Text('Custom'),
                onTap: () async {
                  int? work =
                      await _showCustomInputDialog('Work Time (minutes)');
                  int? breakTime =
                      await _showCustomInputDialog('Break Time (minutes)');
                  if (work != null && breakTime != null) {
                    resetTimer(work * 60);
                    shortBreak = breakTime * 60;
                  }
                  Navigator.of(context).pop();
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Future<int?> _showCustomInputDialog(String label) async {
    TextEditingController controller = TextEditingController();
    return await showDialog<int>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(label),
          content: TextField(
            controller: controller,
            keyboardType: TextInputType.number,
            decoration:
                const InputDecoration(hintText: 'Enter time in minutes'),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(int.tryParse(controller.text));
              },
              child: const Text('OK'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            const SizedBox(height: 140),
            Container(
              child: Image.asset(
                'assets/img/logo2.png',
                height: 50,
                width: 160,
                color: Colors.black,
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              height: 300,
              width: 300,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  CircularProgressIndicator(
                    value: currentTime / totalDuration.toDouble(),
                    strokeWidth: 12,
                    backgroundColor: Colors.grey[300],
                    valueColor:
                        const AlwaysStoppedAnimation<Color>(Colors.blue),
                  ),
                  Center(
                    child: Text(
                      formatTime(currentTime),
                      style: const TextStyle(
                        fontSize: 60,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton(
                  onPressed: startTimer,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0570B2),
                  ),
                  child: const Text(
                    'Start',
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white),
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  onPressed: pauseTimer,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0570B2),
                  ),
                  child: const Text(
                    'Pause',
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white),
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  onPressed: () => resetTimer(workTime),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0570B2),
                  ),
                  child: const Text(
                    'Reset',
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: showWorkOptions,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0570B2),
              ),
              child: const Text(
                'Work Options',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton(
                  onPressed: () => resetTimer(shortBreak),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0570B2),
                  ),
                  child: const Text(
                    'Short Break',
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white),
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  onPressed: () => resetTimer(longBreak),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0570B2),
                  ),
                  child: const Text(
                    'Long Break',
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }
}
