using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Business.Services;

/// <summary>Evalúa el horario con una fecha y hora locales explícitas.</summary>
public static class AttendanceSchedule
{
    public static bool IsValidDate(DateOnly date, DateTimeOffset localNow) =>
        date != default && date <= DateOnly.FromDateTime(localNow.DateTime);

    public static bool CanEdit(Activity? activity, DateOnly date, DateTimeOffset localNow)
    {
        if (activity is null) return false;

        var today = DateOnly.FromDateTime(localNow.DateTime);
        var time = TimeOnly.FromDateTime(localNow.DateTime);
        return date == today && time >= activity.StartTime && time < activity.EndTime;
    }

    public static bool CanRegister(Activity? activity, DateOnly date, DateTimeOffset localNow)
    {
        if (activity is null || !CanEdit(activity, date, localNow)) return false;

        var day = date.DayOfWeek == DayOfWeek.Sunday
            ? ActivityDays.Sunday
            : (ActivityDays)(1 << ((int)date.DayOfWeek - 1));
        return (activity.Days & day) != 0;
    }
}
